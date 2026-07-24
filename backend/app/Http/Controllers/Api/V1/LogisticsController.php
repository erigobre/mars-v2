<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Logistic\StoreLogisticRequest;
use App\Http\Requests\Api\V1\Logistic\UpdateLogisticRequest;
use App\Http\Resources\V1\Logistic\LogisticResource;
use App\Models\Role;
use App\Models\User;
use App\Services\Auth\SellerAuthKeyService;
use App\Services\Phone\PhoneNormalizerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LogisticsController extends ApiController
{
    public function __construct(
        protected PhoneNormalizerService $phoneNormalizer,
        protected SellerAuthKeyService $authKeyService
    ) {
    }

    /**
     * Listar solo usuarios con rol de logística.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 20);

        $query = User::whereHas('role', function ($q) {
                $q->where('slug', 'logistics');
            });

        if ($search) {
            $query->globalSearch($search);
        }

        $logisticsUsers = $query->latest()->paginate($perPage);


        $paginatedData = (LogisticResource::collection($logisticsUsers))->response()->getData(true);

        return $this->successResponse(
            'Usuarios de logística obtenidos exitosamente.',
            $paginatedData);
    }

    /**
     * Crear un nuevo perfil de logística.
     */
    public function store(StoreLogisticRequest $request)
    {
        $validatedData = $request->validated();

        $avatar = $request->file('avatar');

        // Obtenemos el ID del rol de logística
        $logisticsRole = Role::where('slug', 'logistics')->firstOrFail();

        $user = User::create([
            'username' => $validatedData['username'],
            'email' => $validatedData['email'],
            'phone' => $request->normalizedPhone(),
            'birthdate' => $validatedData['birthdate'],
            'is_active' => $validatedData['is_active'] ?? true,
            'role_id' => $logisticsRole->id, // Asignación estricta del rol
        ]);

        if ($avatar) {
            $user->uploadImage($avatar);
        }

        // Sincronizar login_key con el teléfono
        $this->authKeyService->applyNonSellerAuth($user);

        return $this->successResponse('Perfil de logística creado', $user->fresh(), 201);
    }

    /**
     * Actualizar perfil de logística.
     */
    public function update(UpdateLogisticRequest $request, User $logistic)
    {
        if (!$logistic->isLogistics()) {
            return $this->errorResponse('Este usuario no es un perfil de logística.', 403);
        }

        $data = $request->validated();
        $avatar = $request->file('avatar');


        $userData = array_filter([
            'username'  => $data['username'] ?? null,
            'email'     => $data['email'] ?? null,
            'phone'     => isset($data['phone']) ? $this->normalizePhone($data['phone']) : null,
            'birthdate' => $data['birthdate'] ?? null,
            'password'  => isset($data['password']) ? Hash::make($data['password']) : null,
            'is_active' => $data['is_active'] ?? null,
        ], fn($v) => $v !== null);

        $logistic->update($userData);

        if ($avatar) {
            $logistic->uploadImage($avatar);
        }

        // Sincronizar login_key con el teléfono si cambió o por seguridad
        $this->authKeyService->applyNonSellerAuth($logistic->fresh());

        return $this->successResponse('Perfil de logística actualizado', $logistic->fresh());
    }

    /**
     * Eliminar perfil de logística.
     */
    public function destroy(User $logistic)
    {
        if (!$logistic->isLogistics()) {
            return $this->errorResponse('Este usuario no es un perfil de logística.', 403);
        }

        $logistic->delete();

        return $this->successResponse('Perfil eliminado correctamente');
    }

    protected function normalizePhone(string $raw): string
    {
        $normalized = $this->phoneNormalizer->normalize($raw);

        if (!$normalized) {
            throw new \InvalidArgumentException("El número de teléfono '{$raw}' no es válido.");
        }

        return $normalized;
    }
}
