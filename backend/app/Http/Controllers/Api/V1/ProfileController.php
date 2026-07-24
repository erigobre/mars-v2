<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Api\V1\Profile\UpdateProfileRequest;
use App\Http\Resources\V1\Auth\ProfileResource;
use App\Services\Profile\ProfileService;
use Illuminate\Http\Request;

class ProfileController extends ApiController
{
    public function __construct(protected ProfileService $profileService) {}

    public function show(Request $request)
    {
        $user = $request->user()->load([
            'role', 
            'distributor', 
            'seller' => function ($query) {
                $query->with(['salesSnapshots' => function ($sq) {
                    $sq->where(function ($q) {
                        $q->where(function ($cq) {
                            $cq->whereNotNull('redemption_cycle_id')
                               ->whereHas('redemptionCycle', function ($rq) {
                                   $rq->where('start_date', '<=', now());
                               });
                        })->orWhere(function ($cq) {
                            $cq->whereNull('redemption_cycle_id')
                               ->whereHas('campaign', function ($cq2) {
                                   $cq2->where('start_date', '<=', now());
                               });
                        });
                    })->with(['campaign', 'redemptionCycle'])
                    ->orderBy('created_at', 'desc');
                }]);
            }
        ]);
        return $this->successResponse('Perfil obtenido exitosamente', new ProfileResource($user));
    }

    public function update(UpdateProfileRequest $request)
    {
        $user    = $request->user();
        $updated = $this->profileService->update($user, $request->validated(), $request->file('avatar'));

        return $this->successResponse(
            'Perfil actualizado exitosamente.',
            new ProfileResource($updated->load(['role', 'distributor', 'seller']))
        );
    }
}
