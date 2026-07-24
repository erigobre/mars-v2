<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FrigolazoInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $identifier,
        public string $identifierLabel,
        public string $credential,
        public string $credentialLabel,
        public \App\Models\Distributor $distributor
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Invitación a Frigolazo! - Gana premios con tus ventas',
            bcc: [
                new Address('mcobian@wimbly.me', 'Mario Cobian'),
                new Address('elopez@hydis.mx', 'Enrique Lopez'),
                new Address('rreyes@hydis.mx', 'Rodrigo Reyes'),
            ]
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.frigolazo_invite',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
