<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Distributor;
use App\Models\Role;
use App\Models\Seller;
use App\Traits\Filterable;
use App\Traits\HasImage;
use App\Traits\LogsActivity;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens, LogsActivity, HasImage, Filterable;

    protected string $imageColumn = 'avatar'; 
    protected string $imageContext = 'avatar';

    protected $fillable = [
        'username',
        'email',
        'birthdate',
        'login_key',
        'phone',
        'password',
        'role_id',
        'avatar',
        'is_active'
    ];

    protected $hidden = ['password'];

    protected $dates = ['created_at', 'updated_at', 'deleted_at'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
            'birthdate' => 'date:Y-m-d',
            'last_login_at' => 'datetime'
        ];
    }

    protected static function booted()
    {
        static::creating(function (User $user) {
            if (!$user->password && $user->birthdate) {
                $user->password = Carbon::parse($user->birthdate)->format('dmY');
            }
        });

        static::saving(function (User $user) {
            // Sincronizar login_key con el teléfono para roles de gestión
            // Cargamos el slug del rol si no está presente para evitar errores
            $roleSlug = $user->role?->slug;
            
            if (!$roleSlug && $user->role_id) {
                $roleSlug = Role::find($user->role_id)?->slug;
            }

            if ($user->phone && in_array($roleSlug, ['admin', 'distributor', 'logistics'])) {
                $user->login_key = $user->phone;
            }
        });
    }

    public function distributor(): HasOne
    {
        return $this->hasOne(Distributor::class);
    }

    public function seller(): HasOne
    {
        return $this->hasOne(Seller::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    // Helpers

    public function isSeller(): bool       { return $this->role?->slug === 'seller'; }
    public function isDistributor(): bool  { return $this->role?->slug === 'distributor'; }
    public function isAdmin(): bool        { return $this->role?->slug === 'admin'; }
    public function isLogistics(): bool    { return $this->role?->slug === 'logistics';}

    // Métodos para obtener URLs de avatar utilizando el trait HasImage

    public function avatarUrl(): ?string // Nombre del método para obtener la URL del avatar
    {
        return $this->imageUrl(); // Llama internamente al trait
    }

    public function thumbAvatarUrl(): ?string
    {
        return $this->thumbUrl(); // Llama internamente al trait
    }

    protected function setBirthdateAttribute($value)
    {
        if (!$value) return;
    
        try {
            $this->attributes['birthdate'] = Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
            $this->attributes['birthdate'] = $value;
        }
    }

    public function scopeGlobalSearch($query, $value)
    {
        return $query->where(function ($q) use ($value) {
            $q->where('username', 'like', "%{$value}%")
                ->orWhere('email', 'like', "%{$value}%")
                ->orWhere('phone', 'like', "%{$value}%");
        });
    }

    // protected function phone(): Attribute
    // {
    //     return Attribute::make(
    //         set: function (?string $value) {
    //             if (!$value) return null;
                
    //             $normalized = app(PhoneNormalizerService::class)->normalize($value);
                
    //             // Retorna el normalizado, o el original si el servicio falló
    //             return $normalized ?: $value; 
    //         },
    //     );
    // }
    

    public function getLogDescription($action)
    {
        $tipo = match($this->role?->slug ?? '') {
            'admin'       => 'Administrador',
            'distributor' => 'Distribuidor',
            'seller'      => 'Vendedor',
            default       => 'Usuario'
        };

        return match($action) {
            'CREATED' => "Se creó el {$tipo} con el nombre {$this->username} y el correo {$this->email}",
            'UPDATED' => "Se actualizaron los datos del {$tipo} ({$this->email})",
            'DELETED' => "Se eliminó el {$tipo} con el nombre {$this->username} y el correo {$this->email}",
            default   => "Acción sobre {$tipo}"
        };
    }
}
