<?php

namespace App\Traits;

use App\Services\Image\ImageService;
use Illuminate\Http\UploadedFile;

trait HasImage
{
    protected function getImageColumnName(): string
    {
        return $this->imageColumn ?? 'image';
    }

    public function uploadImage(UploadedFile $file): string
    {
        $service = app(ImageService::class);
        $column = $this->getImageColumnName();

        $oldPath = $this->{$column};

        $newPath = $oldPath
            ? $service->replace($oldPath, $file, $this->imageContext)
            : $service->upload($file, $this->imageContext);

        $this->update([$this->imageColumn => $newPath]);

        return $newPath;
    }

    public function deleteImage(): void
    {
        $service = app(ImageService::class);
        $column = $this->getImageColumnName();

        $service->delete($this->{$column}, $this->imageContext);
        $this->update([$column => null]);
    }

    public function imageUrl(): ?string
    {
        $column = $this->getImageColumnName();
        if(!$this->{$column}) return null;
        return app(ImageService::class)->url($this->{$column}, $this->imageContext);
    }

    public function thumbUrl(): ?string
    {
        $column = $this->getImageColumnName();
        if(!$this->{$column}) return null;
        return app(ImageService::class)->thumbUrl($this->{$column}, $this->imageContext);
    }
}
