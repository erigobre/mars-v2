<?php

namespace App\Services\Phone;

use libphonenumber\NumberParseException;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;

/**
 * PhoneNormalizerService
 *
 * Normaliza cualquier formato de teléfono a E.164 (+5216141234567).
 * Dependencia: composer require giggsey/libphonenumber-for-php
 *
 * ─── Formatos aceptados (México) ────────────────────────────────────────────
 *   6141234567           → +5216141234567  (10 dígitos, sin código)
 *   614 123 4567         → +5216141234567  (espacios)
 *   614-123-4567         → +5216141234567  (guiones)
 *   (614) 123-4567       → +5216141234567  (formato NANP)
 *   +52 614 123 4567     → +5216141234567  (internacional estándar)
 *   +521 614 123 4567    → +5216141234567  (con dígito móvil)
 *   52 1 614 123 4567    → +5216141234567  (variante con espacio)
 *
 * ─── Formatos internacionales ───────────────────────────────────────────────
 *   +1 (555) 123-4567    → +15551234567   (USA/Canadá)
 *   +34 612 345 678      → +34612345678   (España)
 *   +57 300 123 4567     → +573001234567  (Colombia)
 *
 * El defaultRegion solo aplica cuando el número llega SIN código de país.
 */
class PhoneNormalizerService
{
    protected PhoneNumberUtil $util;
    protected string $defaultRegion;

    public function __construct(string $defaultRegion = 'MX')
    {
        $this->util = PhoneNumberUtil::getInstance();
        $this->defaultRegion = $defaultRegion;
    }

    /**
     * Normaliza a E.164. Retorna null si el número es inválido.
     *
     * $normalized = $phoneService->normalize('614 123 4567');
     * "+5216141234567"
     */
    public function normalize(string $raw): ?string
    {
        $cleaned = $this->preClean($raw);

        try {
            $parsed = $this->util->parse($cleaned, $this->defaultRegion);

            if (!$this->util->isValidNumber($parsed)) {
                return null;
            }

            return $this->util->format($parsed, PhoneNumberFormat::E164);

        } catch (NumberParseException) {
            return null;
        }
    }

    public function isValid(string $raw): bool
    {
        return $this->normalize($raw) !== null;
    }

    protected function preClean(string $raw): string
    {
        // Quitar separadores visuales
        $cleaned = preg_replace('/[\s\-\.\(\)]+/', '', trim($raw));

        // 10 dígitos sin código → número mexicano local
        if (preg_match('/^[1-9]\d{9}$/', $cleaned)) {
            return '+52' . $cleaned;
        }

        // 521 + 10 dígitos (dígito móvil sin +)
        if (preg_match('/^521\d{10}$/', $cleaned)) {
            return '+' . $cleaned;
        }

        // 52 + 10 dígitos (código país sin + ni dígito móvil)
        if (preg_match('/^52\d{10}$/', $cleaned)) {
            return '+' . $cleaned;
        }

        return $cleaned;
    }
}