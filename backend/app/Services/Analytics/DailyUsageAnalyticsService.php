<?php

namespace App\Services\Analytics;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DailyUsageAnalyticsService
{
    private const CACHE_TTL_SECONDS = 300; // 5 minutes
    private const LOGIN_ACTION      = 'LOGIN_SUCCESS';

    public function getDailyUsageReport(
        ?string $date         = null,
        ?string $tz           = null,
        ?string $role         = null,
        ?int    $distributorId = null
    ): array {
        $tz         = $tz   ?? config('app.display_timezone', 'America/Mexico_City');
        $targetDate = $date ?? now($tz)->toDateString();

        $cacheKey = "analytics:daily_usage:{$targetDate}:{$tz}:role={$role}:dist={$distributorId}";

        return Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($targetDate, $tz, $role, $distributorId) {

            $userIds = $this->resolveUserIds($role, $distributorId);

            return [
                'date'             => $targetDate,
                'timezone'         => $tz,
                'active_filters'   => [
                    'role'           => $role,
                    'distributor_id' => $distributorId,
                ],
                'kpi_total_today'  => $this->countUniqueLoginsForDate($targetDate, $userIds),
                'kpi_active_users' => $this->countCurrentlyActiveUsers($userIds),
                'kpi_new_users'    => $this->countNewUsersForDate($targetDate, $userIds),
                'chart_data'       => $this->buildHourlyChartData($targetDate, $tz, $userIds),
                'role_breakdown'   => $this->getRoleBreakdown($targetDate, $userIds),
                'top_actions'      => $this->getTopActions($targetDate, 5, $userIds),
                'recent_logins'    => $this->getRecentLogins($targetDate, 10, $userIds),
            ];
        });
    }

    private function resolveUserIds(?string $role = null, ?int $distributorId = null): ?array
    {
        if ($role === null && $distributorId === null) {
            return null;
        }

        $query = DB::table('users')->select('users.id');

        if ($role !== null) {
            $query->join('roles', 'roles.id', '=', 'users.role_id')
                ->where('roles.slug', $role);
        }

        if ($distributorId !== null) {
            $query->join('sellers', 'sellers.user_id', '=', 'users.id')
                ->where('sellers.distributor_id', $distributorId)
                ->whereNull('sellers.deleted_at');
        }

        $ids = $query->pluck('id')->toArray();
        return $ids;
    }

    private function applyUserFilter($query, ?array $userIds)
    {
        if ($userIds === null) {
            return $query;
        }
        return $query->whereIn('user_id', $userIds);
    }

    public function countUniqueLoginsForDate(string $date, ?array $userIds = null): int
    {
        $query = ActivityLog::query()
            ->where('action_type', self::LOGIN_ACTION)
            ->whereDate('created_at', $date);

        $this->applyUserFilter($query, $userIds);

        return $query->distinct('user_id')->count('user_id');
    }

    public function countCurrentlyActiveUsers(?array $userIds = null): int
    {
        $query = DB::table('personal_access_tokens')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });

        if ($userIds !== null) {
            $query->whereIn('tokenable_id', $userIds);
        }

        return $query->distinct('tokenable_id')->count('tokenable_id');
    }

    public function countNewUsersForDate(string $date, ?array $userIds = null): int
    {
        $query = User::whereDate('created_at', $date);

        if ($userIds !== null) {
            $query->whereIn('id', $userIds);
        }

        return $query->count();
    }

    public function buildHourlyChartData(string $date, string $tz, ?array $userIds = null): array
    {
        $hours = array_fill(0, 24, 0);

        $query = ActivityLog::query()
            ->selectRaw(
                "HOUR(CONVERT_TZ(created_at, '+00:00', ?)) AS hour_local, COUNT(DISTINCT user_id) AS login_count",
                [$this->tzOffset($tz)]
            )
            ->where('action_type', self::LOGIN_ACTION)
            ->whereDate(
                DB::raw("CONVERT_TZ(created_at, '+00:00', '{$this->tzOffset($tz)}')"),
                $date
            )
            ->groupBy(DB::raw('hour_local'))
            ->orderBy(DB::raw('hour_local'));

        $this->applyUserFilter($query, $userIds);

        foreach ($query->get() as $row) {
            $hours[(int) $row->hour_local] = (int) $row->login_count;
        }

        $labels = array_map(fn(int $h) => sprintf('%02d:00', $h), range(0, 23));
        $series = array_values($hours);

        return compact('labels', 'series');
    }

    public function getRoleBreakdown(string $date, ?array $userIds = null): array
    {
        $query = DB::table('activity_logs')
            ->join('users', 'users.id', '=', 'activity_logs.user_id')
            ->join('roles', 'roles.id', '=', 'users.role_id')
            ->select('roles.slug as role', DB::raw('COUNT(DISTINCT activity_logs.user_id) AS count'))
            ->where('activity_logs.action_type', self::LOGIN_ACTION)
            ->whereDate('activity_logs.created_at', $date)
            ->groupBy('roles.slug');

        if ($userIds !== null) {
            $query->whereIn('activity_logs.user_id', $userIds);
        }

        return $query->get()
            ->map(fn($r) => ['role' => $r->role, 'count' => (int) $r->count])
            ->values()
            ->all();
    }

    public function getTopActions(string $date, int $limit = 5, ?array $userIds = null): array
    {
        $query = ActivityLog::query()
            ->select('action_type', DB::raw('COUNT(*) as occurrences'))
            ->whereDate('created_at', $date)
            ->groupBy('action_type')
            ->orderByDesc('occurrences')
            ->limit($limit);

        $this->applyUserFilter($query, $userIds);

        return $query->get()
            ->map(fn($r) => [
                'action'      => $r->action_type,
                'occurrences' => (int) $r->occurrences,
            ])
            ->values()
            ->all();
    }

    private function getRecentLogins(string $date, int $limit = 10, ?array $userIds = null): array
    {
        $query = ActivityLog::query()
            ->with('user')
            ->where('action_type', self::LOGIN_ACTION)
            ->whereDate('created_at', $date)
            ->orderByDesc('created_at')
            ->limit($limit);

        $this->applyUserFilter($query, $userIds);

        return $query->get()
            ->map(function ($log) {
                $user = $log->user;
                return [
                    'id'         => $log->id,
                    'user_name'  => $user ? $user->username : 'Usuario Desconocido',
                    'avatar_url' => $user ? $user->avatar : null,
                    'role'       => $user ? $user->role : 'Desconocido',
                    'tier'       => $user && $user->tier ? $user->tier : null,
                    'timestamp'  => $log->created_at->toIso8601String(),
                    'device'     => $log->ip_address ?? 'Desconocido',
                ];
            })
            ->values()
            ->all();
    }

    private function tzOffset(string $tz): string
    {
        try {
            $dt     = new \DateTimeImmutable('now', new \DateTimeZone($tz));
            $offset = (int) $dt->getOffset();
            $sign   = $offset >= 0 ? '+' : '-';
            $abs    = abs($offset);
            $h      = intdiv($abs, 3600);
            $m      = intdiv($abs % 3600, 60);
            return sprintf('%s%02d:%02d', $sign, $h, $m);
        } catch (\Throwable) {
            return '+00:00';
        }
    }
}
