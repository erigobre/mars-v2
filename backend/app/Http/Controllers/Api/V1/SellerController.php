<?php

namespace App\Http\Controllers\Api\V1;

use App\Filters\SellerFilter;
use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Seller\RegisterSellerRequest;
use App\Http\Requests\Api\V1\Seller\StoreSellerRequest;
use App\Http\Requests\Api\V1\Seller\UpdateSellerRequest;
use App\Http\Requests\Api\V1\Seller\BulkSellerActionRequest;
use App\Http\Resources\V1\Auth\AuthUserResource;
use App\Http\Resources\V1\Seller\SellerCollection;
use App\Http\Resources\V1\Seller\SellerDashboardResource;
use App\Http\Resources\V1\Seller\SellerResource;
use App\Models\Seller;
use App\Mail\SellerReactivationMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Services\Seller\SellerDashboardService;
use App\Services\Seller\SellerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SellerController extends ApiController
{

    public function __construct(
        protected SellerService $sellerService,
        protected SellerDashboardService $dashboardService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Seller::class);

        $search = $request->query('search');
        $perPage = $request->input('per_page', 15);
        $query = Seller::with(['user', 'tier']);

        $user = $request->user();

        if ($user->role->slug === 'admin') {
            $query->with('distributor');
        }

        if ($user->role->slug === 'distributor') {
            $query->where('distributor_id', $user->distributor->id);
        } elseif ($request->query('distributorId')) {
            $query->where('distributor_id', $request->query('distributorId'));
        }

        if ($search) $query->globalSearch($search);

        $query->filter(new SellerFilter());

        $isActive = $request->query('isActive');
        if (isset($isActive['eq'])) {
            $val = filter_var($isActive['eq'], FILTER_VALIDATE_BOOLEAN);
            $query->whereHas('user', function($q) use ($val) {
                $q->where('is_active', $val);
            });
        }

        $sort = $request->query('sort');
        if ($sort === 'points') {
            $query->orderBy('current_points', 'desc');
        } elseif ($sort === 'name') {
            $query->join('users as u_sort', 'u_sort.id', '=', 'sellers.user_id')
                  ->orderBy('u_sort.username', 'asc')
                  ->select('sellers.*');
        } else {
            $query->latest();
        }

        $sellers = $query->paginate($perPage);

        $paginatedData = (new SellerCollection($sellers))->response()->getData(true);

        return $this->successResponse('Vendedores obtenidos exitosamente.', $paginatedData);
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Seller::class);

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\Sellers\GlobalSellersExport(),
            'Vendedores_Global_' . now()->format('Y_m_d') . '.xlsx'
        );
    }

    public function dashboard(Request $request)
    {
        $seller = $request->user()->seller;

        if (!$seller) {
            return $this->notFound('Perfil de vendedor no encontrado.');
        }

        $seller->load('user');

        $data = $this->dashboardService->getData($seller);

        return $this->successResponse('Dashboard obtenido exitosamente.', new SellerDashboardResource($data));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSellerRequest $request)
    {
        $this->authorize('create', Seller::class);

        try {
            $data = $request->validated();

            $user = $request->user();
            if ($user->role->slug === 'distributor') {
                $data['distributor_id'] = $user->distributor->id;
            }

            $seller = $this->sellerService->create($data, $request->file('avatar'));

            return $this->created(
                new SellerResource($seller),
                'Vendedor creado exitosamente'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function register(RegisterSellerRequest $request)
    {
        try {
            $data = $request->validated();
            
            if ($request->has('existing_user')) {
                $user = $request->existing_user;
                $user->load(['seller.distributor']);
                
                $authKeyService = app(\App\Services\Auth\SellerAuthKeyService::class);
                $distributor = $user->seller->distributor;
                
                // Re-aplicar auth para asegurar que la DB esté alineada con el config actual
                $authKeyService->applyAuth($user->seller, $distributor);
                
                $identifier = $authKeyService->resolveIdentifier($distributor->identifier_type, $user, $user->seller);
                $credential = $authKeyService->resolveCredential($distributor->credential_type, $user, $user->seller);
                
                $identifierLabel = $distributor->identifier_type->label();
                $credentialLabel = $distributor->credential_type->label();
                
                // Enviar correo
                if (app()->environment('production')) {
                    Mail::to($user->email)->send(new SellerReactivationMail($user, $identifier, $identifierLabel, $credential, $credentialLabel, $distributor));
                }
                
                return $this->successResponse(
                    'Ya existía un registro previo. Te hemos enviado un correo con tus credenciales de acceso actualizadas.',
                    $user->seller,
                    200
                );
            }

            Log::info('Data', ['data' => $data]);
            $data['is_active'] = false;
            $seller = $this->sellerService->create($data, $request->file('avatar'));

            return $this->successResponse(
                'Registro completado. Tu cuenta está pendiente de activación por un administrador o distribuidor.',
                $seller,
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Seller $seller)
    {
        $this->authorize('view', $seller);

        $seller->load([
            'user',
            'distributor',
            'tier',
            'goalProgresses.goal',
            'salesSnapshots.redemptionCycle',
            'salesSnapshots.campaign'
        ]);

        $seller->loadCount('sales');

        return $this->successResponse(
            'Vendedor obtenido exitosamente',
            new SellerResource($seller)
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSellerRequest $request, Seller $seller)
    {
        $this->authorize('update', $seller);

        try {
            $data = $request->validated();

            $user = $request->user();

            if ($user->role->slug === 'seller') {
                unset($data['distributor_id']);
                unset($data['current_points']);
                unset($data['is_active']);
            }

            if ($user->role->slug === 'distributor' && isset($data['distributor_id'])) {
                if ($data['distributor_id'] != $user->distributor->id) {
                    return $this->forbidden('No puedes transferir vendedores a otro distribuidor');
                }
            }

            $seller = $this->sellerService->update($seller, $data, $request->file('avatar'));

            return $this->successResponse(
                'Vendedor actualizado exitosamente',
                new SellerResource($seller)
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Seller $seller)
    {
        $this->authorize('delete', $seller);

        try {
            $this->sellerService->delete($seller);

            return $this->deleted('Vendedor eliminado exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function acceptTerms(Request $request)
    {
        $user = $request->user();
        $seller = $user->seller;

        if (!$seller) {
            return $this->errorResponse('No se encontró un perfil de vendedor para este usuario.', 403);
        }

        if ($seller->terms_accepted) {
            return $this->errorResponse('Los términos y condiciones ya han sido aceptados anteriormente.', 400);
        }

        $seller->update([
            'terms_accepted' => true
        ]);

        log_action('ACCEPTED_TERMS', $user, "El vendedor {$user->email} aceptó los términos y condiciones.");

        $user->refresh();

        return $this->successResponse('Términos y condiciones aceptados correctamente.', new AuthUserResource($user));
    }

    public function bulkAction(BulkSellerActionRequest $request)
    {
        $data = $request->validated();
        $sellerIds = $data['seller_ids'];
        $action = $data['action'];

        try {
            switch ($action) {
                case 'activate':
                    \App\Models\User::whereIn('id', function($query) use ($sellerIds) {
                        $query->select('user_id')->from('sellers')->whereIn('id', $sellerIds);
                    })->update(['is_active' => true]);
                    break;
                case 'deactivate':
                    \App\Models\User::whereIn('id', function($query) use ($sellerIds) {
                        $query->select('user_id')->from('sellers')->whereIn('id', $sellerIds);
                    })->update(['is_active' => false]);
                    break;
                case 'delete':
                    $sellers = Seller::whereIn('id', $sellerIds)->get();
                    foreach ($sellers as $seller) {
                        $this->sellerService->delete($seller);
                    }
                    break;
                case 'adjust_points':
                    $points = $data['points'];
                    $effectiveDate = $data['effective_date'] ?? null;
                    $sellers = Seller::whereIn('id', $sellerIds)->get();
                    foreach ($sellers as $seller) {
                        $seller->current_points = max(0, $seller->current_points + $points);
                        $seller->save();

                        $transaction = new \App\Models\PointTransaction([
                            'seller_id' => $seller->id,
                            'type' => \App\Enums\PointTransactionTypes::MANUAL_ADJUSTMENT->value,
                            'amount' => $points,
                            'balance_after' => $seller->current_points,
                        ]);
                        if ($effectiveDate) {
                            $transaction->created_at = $effectiveDate . ' 12:00:00';
                        }
                        $transaction->save();
                    }
                    break;
            }

            return $this->successResponse('Acción masiva ejecutada correctamente.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function deactivateAccount(Request $request)
    {
        $user = $request->user();
        $seller = $user->seller;

        if (!$seller) {
            return $this->errorResponse('No se encontró un perfil de vendedor para este usuario.', 403);
        }

        $user->update(['is_active' => false]);

        $user->tokens()->delete();

        log_action('DESACTIVATE_ACCOUNT', $user, "El usuario desactivó su propia cuenta");

        return $this->successResponse('Tu cuenta ha sido desactivada exitosamente. Se ha cerrado tu sesión.');
    }

    public function transactions(Seller $seller, Request $request)
    {
        $this->authorize('view', $seller);

        $perPage = $request->input('per_page', 15);
        $transactions = $seller->pointTransactions()
            ->with(['sale'])
            ->latest()
            ->paginate($perPage);

        return $this->successResponse(
            'Transacciones obtenidas exitosamente',
            $transactions
        );
    }

    public function generateMagicPassword(Seller $seller)
    {
        // Solo accesible para admins según las rutas
        $user = $seller->user;
        
        $words = ['Sol', 'Luna', 'Luz', 'Mar', 'Rayo', 'Miel', 'Paz', 'Flor', 'Roca', 'Oro', 'Cielo', 'Vida'];
        $word = $words[array_rand($words)];
        $number = rand(10, 99);
        $newPassword = $word . $number;

        $user->password = $newPassword;
        $user->save();

        log_action('PASSWORD_GENERATED', $user, "Un administrador generó una contraseña mágica para este vendedor.");

        $identifier = explode('/', $user->login_key)[1] ?? $user->login_key;

        return $this->successResponse('Contraseña mágica generada.', [
            'password' => $newPassword,
            'login_key' => $identifier,
            'distributor' => $seller->distributor->company_name
        ]);
    }
}
