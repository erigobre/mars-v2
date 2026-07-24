<?php

namespace App\Enums;

enum CampaignStatus: string
{
    case RUNNING = 'RUNNING';
    case PAUSED = 'PAUSED';
    case COMPLETED = 'COMPLETED';

    public function label(): string
    {
        return match ($this) {
            self::RUNNING => 'Running',
            self::PAUSED => 'Paused',
            self::COMPLETED => 'Completed',
        };
    }

    public static function values(): array
    {
        return array_map(fn($status) => $status->value, self::cases());
    }
}
