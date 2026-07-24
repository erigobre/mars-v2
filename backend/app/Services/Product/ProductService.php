<?php

namespace App\Services\Product;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function create(array $data, ?UploadedFile $file = null): Product
    {
        return DB::transaction(function () use ($data, $file) {
            $product = Product::create($data);

            if($file) $product->uploadImage($file);
            
            return $product;
        });
    }

    public function update(Product $product, array $data, ?UploadedFile $file = null): Product
    {
        return DB::transaction(function () use ($product, $data, $file) {
            $product->update($data);

            if($file) $product->uploadImage($file);
            
            return $product->fresh();
        });
    }

    public function delete(Product $product): void
    {
        DB::transaction(function () use ($product) {
            $product->distributorProducts()->delete();
            $product->deleteImage();
            $product->delete();
        });
    }
}