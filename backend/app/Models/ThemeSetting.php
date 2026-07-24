<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class ThemeSetting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'label'];

    public static function allAsMap(): array
    {
        return Cache::remember('theme_settings', 86400, function () {
            return static::pluck('value', 'key')->toArray();
        });
    }

    public static function updateKey(string $key, string $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget('theme_settings');
    }

    public static function bulkUpdate(array $data): void
    {
        foreach ($data as $key => $value) {
            static::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        Cache::forget('theme_settings');
    }
}
