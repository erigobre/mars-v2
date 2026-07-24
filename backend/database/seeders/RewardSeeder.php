<?php

namespace Database\Seeders;

use App\Models\Reward;
use Database\Seeders\Data\RewardCatalog;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class RewardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $premios = RewardCatalog::get();

        $imageDirectory = database_path('data/images/rewards/');

        foreach ($premios as $data) {
            $filename = $data['image_filename'];
            
            unset($data['image_filename']); // Quitamos esto porque no existe en la BD
            unset($data['base_cost']);

            $reward = Reward::create($data);

            $imagePath = $imageDirectory . $filename;

            if (File::exists($imagePath)) {
                $file = new UploadedFile(
                    $imagePath,
                    $filename,
                    mime_content_type($imagePath),
                    null,
                    true 
                );

                $reward->uploadImage($file);
                
                $this->command->info("Premio creado y foto subida: {$reward->name}");
            } else {
                $this->command->warn("Se creó el premio '{$reward->name}', pero la imagen '{$filename}' no se encontró en '{$imageDirectory}'");
            }
        }
    }
}
