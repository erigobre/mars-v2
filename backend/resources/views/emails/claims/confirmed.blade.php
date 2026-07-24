<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Nuevo Canje de Premio</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #2563eb;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .header h2 { margin: 0; }
        .content {
            padding: 30px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
        .info-box {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .badge-pending {
            background-color: #fef3c7;
            color: #92400e;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            text-transform: uppercase;
        }
        .btn-primary {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 14px;
            text-align: center;
            margin-top: 20px;
        }
        table { width: 100%; border-collapse: collapse; }
        td { vertical-align: middle; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>¡Nuevo Canje Recibido!</h2>
        </div>
        <div class="content">
            <p>Hola,</p>
            <p>Un vendedor ha solicitado una recompensa y requiere tu atención para procesar el envío.</p>
            
            <div class="info-box">
                <table>
                    <tr>
                        <td>
                            <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Folio del Canje</span>
                            <h3 style="margin: 5px 0 0 0; color: #0f172a;">{{ $claim->folio }}</h3>
                        </td>
                        <td align="right">
                            <span class="badge-pending">Pendiente</span>
                        </td>
                    </tr>
                </table>
            </div>

            <h4 style="color: #64748b; text-transform: uppercase; font-size: 12px; margin-bottom: 5px;">Datos del Premio</h4>
            <div class="info-box">
                <table>
                    <tr>
                        <td width="64" style="padding-right: 15px;">
                            <img src="{{ $claim->reward->imageUrl() ?? 'https://placehold.co/600x600?text=Sin+Imagen' }}" width="64" height="64" style="border-radius: 8px;">
                        </td>
                        <td>
                            <strong style="color: #0f172a;">{{ $claim->reward->name }}</strong><br>
                            <span style="color: #2563eb; font-weight: bold;">{{ number_format($claim->points_spent) }} pts</span>
                        </td>
                    </tr>
                </table>
            </div>

            <h4 style="color: #64748b; text-transform: uppercase; font-size: 12px; margin-bottom: 5px; margin-top: 20px;">Datos del Vendedor</h4>
            <div class="info-box" style="line-height: 1.8; font-size: 14px;">
                <strong style="color: #0f172a; font-size: 15px;">{{ $claim->seller->user->username }}</strong><br>
                <span style="color: #64748b;">📧 {{ $claim->seller->user->email }}</span><br>
                <span style="color: #64748b;">📞 {{ $claim->seller->user->phone ?? 'Sin teléfono' }}</span>
            </div>

            <h4 style="color: #64748b; text-transform: uppercase; font-size: 12px; margin-bottom: 5px; margin-top: 20px;">Dirección de Envío</h4>
            <div class="info-box" style="font-size: 14px;">
                <strong style="color: #0f172a;">{{ $claim->shipping_street }}</strong><br>
                <span style="color: #64748b;">Colonia {{ $claim->shipping_colonia }}, {{ $claim->shipping_city }}</span><br>
                <span style="color: #64748b;">{{ $claim->shipping_state }}, C.P. {{ $claim->shipping_zip }}</span>
                
                @if($claim->notes || isset($claim->seller->shipping_notes))
                    <hr style="border: 0; border-top: 1px dashed #cbd5e1; margin: 15px 0;">
                    <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Notas de Entrega</strong><br>
                    <span style="font-style: italic; color: #475569;">"{{ $claim->notes ?? $claim->seller->shipping_notes }}"</span>
                @endif
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ config('app.url') }}/admin/claims/{{ $claim->id }}" class="btn-primary">
                    Gestionar Canje
                </a>
            </div>
        </div>
        <div class="footer">
            <p>Este es un correo automático generado por {{ config('app.name', 'el Programa de Incentivos') }}.</p>
        </div>
    </div>
</body>
</html>