<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <title>Comprobante de Canje</title>
    <style>
        /* Estilos estrictos y simples para DOMPDF */
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #374151;
            margin: 0;
            padding: 30px;
            font-size: 14px;
            line-height: 1.5;
        }

        /* Encabezado */
        .header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .title {
            font-size: 26px;
            color: #111827;
            margin: 0 0 5px 0;
        }

        .subtitle {
            color: #6b7280;
            margin: 0;
            font-size: 14px;
        }

        /* Caja de Folio */
        .folio-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin-bottom: 30px;
            width: 50%;
            margin-left: auto;
            margin-right: auto;
        }

        .folio-label {
            font-size: 11px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: bold;
            margin: 0 0 5px 0;
            letter-spacing: 1px;
        }

        .folio-number {
            font-size: 22px;
            color: #2563eb;
            font-weight: bold;
            margin: 0;
        }

        /* Columnas de Información */
        table.content-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        table.content-table td {
            vertical-align: top;
            padding: 15px;
            width: 50%;
            border: 1px solid #e5e7eb;
            background-color: #ffffff;
        }

        .section-title {
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: bold;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 15px;
            margin-top: 0;
        }

        /* Textos internos */
        .item-name {
            font-size: 18px;
            font-weight: bold;
            color: #111827;
            margin: 0 0 8px 0;
        }

        .item-cost {
            font-size: 16px;
            color: #2563eb;
            font-weight: bold;
            margin: 0;
        }

        .address-name {
            font-size: 16px;
            font-weight: bold;
            color: #111827;
            margin: 0 0 8px 0;
        }

        .address-text {
            margin: 0 0 4px 0;
            color: #4b5563;
        }

        .notes-label {
            font-size: 12px;
            font-weight: bold;
            margin: 15px 0 5px 0;
        }

        .notes-text {
            font-style: italic;
            color: #6b7280;
            margin: 0;
        }

        /* Footer */
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
        }

        /* Evitar que las cajas se corten a la mitad en saltos de página */
        .avoid-break {
            page-break-inside: avoid;
        }
    </style>
</head>

<body>

    <div class="header">
        <h1 class="title">¡Felicidades, {{ $claim->seller->user->username }}!</h1>
        <p class="subtitle">Hemos recibido tu solicitud de canje. Tu premio está siendo procesado.</p>
    </div>

    <div class="folio-box avoid-break">
        <p class="folio-label">Folio de Seguimiento</p>
        <p class="folio-number">{{ $claim->folio }}</p>
    </div>

    <table class="content-table avoid-break">
        <tr>
            <!-- Columna Izquierda: Premio -->
            <td style="border-right: 10px solid #ffffff;">
                <h3 class="section-title">Tu Recompensa</h3>

                @if(isset($imagenBase64))
                <div style="text-align: center; margin-bottom: 15px;">
                    <img src="{{ $imagenBase64 }}" width="120" style="border-radius: 8px;">
                </div>
                @endif

                <div style="text-align: center;">
                    <p class="item-name">{{ $claim->reward->name }}</p>
                    <p class="item-cost">Costo: {{ number_format($claim->points_spent) }} pts</p>
                </div>
            </td>

            <!-- Columna Derecha: Dirección -->
            <td>
                <h3 class="section-title">Se enviará a:</h3>
                <p class="address-name">{{ $claim->shipping_name ?? $claim->seller->user->username }}</p>
                <p class="address-text">{{ $claim->shipping_street }}</p>
                <p class="address-text">Col. {{ $claim->shipping_colonia }}</p>
                <p class="address-text">{{ $claim->shipping_city }}, {{ $claim->shipping_state }}</p>
                <p class="address-text">C.P. {{ $claim->shipping_zip }}</p>

                @if($claim->shipping_notes)
                <p class="notes-label">Notas de entrega:</p>
                <p class="notes-text">"{{ $claim->shipping_notes }}"</p>
                @endif
            </td>
        </tr>
    </table>

    <div class="footer avoid-break">
        <p style="margin: 0 0 5px 0;"><strong>¿Qué sigue ahora?</strong></p>
        <p style="margin: 0;">Te notificaremos por correo cuando tu premio haya sido aprobado y enviado.</p>
        <p style="margin: 5px 0 0 0;">Generado el {{ now()->format('d/m/Y') }} a las {{ now()->format('H:i') }}</p>
    </div>

</body>

</html>