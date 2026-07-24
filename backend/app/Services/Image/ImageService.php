<?php

namespace App\Services\Image;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageService
{
    /**
     * Configuración por contexto.
     * Cada "contexto" define: disco, carpeta, dimensiones máximas, calidad y thumbnail.
     */
    protected array $contexts = [
        'avatar' => [
            'disk'      => 'public',
            'path'      => 'avatars',
            'maxWidth'  => 400,
            'maxHeight' => 400,
            'quality'   => 80,
            'thumb'     => false,
        ],
        'reward' => [
            'disk'      => 'public',
            'path'      => 'rewards',
            'maxWidth'  => 800,
            'maxHeight' => 800,
            'quality'   => 85,
            'thumb'     => true,
            'thumbSize' => 200,
        ],
        'product' => [
            'disk'      => 'public',
            'path'      => 'products',
            'maxWidth'  => 1200,
            'maxHeight' => 1200,
            'quality'   => 85,
            'thumb'     => true,
            'thumbSize' => 300,
        ],
        'campaign' => [
            'disk'      => 'public',
            'path'      => 'campaigns',
            'maxWidth'  => 1600,
            'maxHeight' => 900,
            'quality'   => 90,
            'thumb'     => false,
        ],
    ];

    /**
     * Sube una imagen para un contexto dado.
     * Retorna el path relativo al disco (este es el valor que guardas en DB).
     *
     * Uso:
     *   $path = $imageService->upload($request->file('image'), 'avatar');
     *   $seller->update(['avatar' => $path]);
     */
    public function upload(UploadedFile $file, string $context): string
    {
        $config = $this->getConfig($context);

        $manager = new ImageManager(new Driver());

        $image = $manager->read($file);

        $image->scaleDown(width: $config['maxWidth'], height: $config['maxHeight']);

        $filename = $this->generateFilename($file);
        $fullPath = $config['path'] . '/' . $filename;
        $extension = $this->getExtension($file);

        $encodedImage = $this->encodeImage($image, $extension, $config['quality']);
        Storage::disk($config['disk'])->put($fullPath, $encodedImage);

        if ($config['thumb'] ?? false) {
            $thumbPath = $config['path'] . '/thumbs/' . $filename;
            
            $thumb = $manager->read($file);
            $thumb->cover(width: $config['thumbSize'], height: $config['thumbSize']);

            $encodedThumb = $this->encodeImage($thumb, $extension, 70);
            
            Storage::disk($config['disk'])->put($thumbPath, $encodedThumb);
        }

        return $fullPath;
    }

    /**
     * Elimina imagen y su thumb (si aplica) del disco.
     *
     * Uso:
     *   $imageService->delete($seller->avatar, 'avatar');
     */
    public function delete(?string $path, string $context): void
    {
        if (empty($path)) return;

        $config = $this->getConfig($context);
        $disk   = Storage::disk($config['disk']);

        $disk->delete($path);

        if ($config['thumb'] ?? false) {
            $disk->delete($this->toThumbPath($path));
        }
    }

    /**
     * Reemplaza: borra la anterior y sube la nueva.
     * Es el método que usarás en los updates (PUT/PATCH).
     *
     * Uso:
     *   $newPath = $imageService->replace($reward->image, $request->file('image'), 'reward');
     *   $reward->update(['image' => $newPath]);
     */
    public function replace(?string $oldPath, UploadedFile $newFile, string $context): string
    {
        $this->delete($oldPath, $context);
        return $this->upload($newFile, $context);
    }

    /**
     * URL pública de un path guardado en DB.
     * En local: apunta a storage/ via symlink.
     * En S3: genera URL firmada o pública según configuración del disco.
     *
     * Uso en Resource:
     *   'imageUrl' => $this->imageService->url($this->image, 'reward'),
     */
    public function url(?string $path, string $context): ?string
    {
        if (empty($path)) return null;
        $config = $this->getConfig($context);
        return Storage::disk($config['disk'])->url($path);
    }

    public function thumbUrl(?string $path, string $context): ?string
    {
        if (empty($path)) return null;
        $config = $this->getConfig($context);

        if (!($config['thumb'] ?? false)) {
            return $this->url($path, $context);
        }

        return Storage::disk($config['disk'])->url($this->toThumbPath($path));
    }

    // ─── Helpers internos ────────────────────────────────────────────────────

    protected function encodeImage($image, string $extension, int $quality): string
    {
        return match ($extension) {
            'png'   => $image->toPng()->toString(), // PNG no usa el mismo parámetro de calidad en v3
            'webp'  => $image->toWebp($quality)->toString(),
            'gif'   => $image->toGif()->toString(),
            default => $image->toJpeg($quality)->toString(),
        };
    }

    protected function getConfig(string $context): array
    {
        if (!isset($this->contexts[$context])) {
            throw new \InvalidArgumentException("Contexto de imagen desconocido: [{$context}]");
        }
        return $this->contexts[$context];
    }

    protected function generateFilename(UploadedFile $file): string
    {
        // UUID garantiza nombres únicos sin colisiones entre tenants/registros
        return Str::uuid() . '.' . strtolower($file->getClientOriginalExtension() ?: 'jpg');
    }

    protected function getExtension(UploadedFile $file): string
    {
        return strtolower($file->getClientOriginalExtension()) ?: 'jpg';
    }

    protected function toThumbPath(string $path): string
    {
        return dirname($path) . '/thumbs/' . basename($path);
    }
}