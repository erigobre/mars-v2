<?php

namespace App\Providers;

use App\Models\Distributor;
use App\Models\Product;
use App\Models\RewardClaim;
use App\Models\Seller;
use App\Policies\DistributorPolicy;
use App\Policies\ProductPolicy;
use App\Policies\RewardClaimPolicy;
use App\Policies\SellerPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;


class AuthServiceProvider extends ServiceProvider
{

    protected $policies = [
        Distributor::class => DistributorPolicy::class,
        Seller::class => SellerPolicy::class,
        Product::class => ProductPolicy::class,
        RewardClaim::class => RewardClaimPolicy::class,
    ]; 

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
