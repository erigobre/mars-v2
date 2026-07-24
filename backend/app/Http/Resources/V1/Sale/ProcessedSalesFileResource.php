<?php

namespace App\Http\Resources\V1\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcessedSalesFileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'batchUuid' => $this->batch_uuid,
            'originalFileName' => $this->original_file_name,
            'distributorId' => $this->distributor_id,
            'createdById' => $this->created_by_id,
            'createdAt' => $this->created_at,
        ];
    }
}
