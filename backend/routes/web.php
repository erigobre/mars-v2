<?php

// use App\Mail\RewardClaimConfirmedMail;
// use App\Models\RewardClaim;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Route::get('/preview-email', function () {
//     // 1. Buscamos un canje real en tu base de datos para que el correo tenga datos verdaderos.
//     // Usamos 'with' para cargar las relaciones que tu vista de Blade necesita.
//     $claim = RewardClaim::with(['reward', 'seller.user'])->latest()->first();

//     // Si no tienes ningún canje, la pantalla fallará, así que asegúrate de tener al menos 1 registrado.
//     if (!$claim) {
//         return "Crea al menos un canje en la base de datos para ver el preview.";
//     }

//     // 2. Al retornar la clase Mailable, Laravel automáticamente la renderiza como HTML en tu navegador.
//     return new RewardClaimConfirmedMail($claim);
// });
