<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\ApiController;
use App\Models\ThemeSetting;
use Illuminate\Http\Request;

class ThemeController extends ApiController
{
    public function show()
    {
        return $this->successResponse('Tema obtenido.', ThemeSetting::allAsMap());
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'settings'          => 'required|array',
            'settings.*.key'    => 'required|string|max:100',
            'settings.*.value'  => 'required|string|max:1000',
        ]);

        $map = collect($data['settings'])->pluck('value', 'key')->toArray();
        ThemeSetting::bulkUpdate($map);

        return $this->successResponse('Tema actualizado.', ThemeSetting::allAsMap());
    }
}
