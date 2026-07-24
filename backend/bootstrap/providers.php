<?php

use Mailjet\LaravelMailjet\MailjetServiceProvider;

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\AuthServiceProvider::class,
    MailjetServiceProvider::class
];
