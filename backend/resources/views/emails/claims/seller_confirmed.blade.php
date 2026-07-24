<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Confirmación de Canje</title>
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
            margin: 20px 0;
            border-radius: 4px;
        }
        .badge-success {
            background-color: #dcfce7;
            color: #166534;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            text-transform: uppercase;
        }
        table { width: 100%; border-collapse: collapse; }
        td { vertical-align: middle; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>¡Tu Canje está en proceso!</h2>
        </div>
        <div class="content">
            <p>Hola <strong>{{ $claim->seller->user->username }}</strong>,</p>
            <p>Hemos recibido tu solicitud de canje. Pronto procesaremos tu envío.</p>
            
            <div class="info-box">
                <table>
                    <tr>
                        <td>
                            <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Folio de seguimiento</span>
                            <h3 style="margin: 5px 0 0 0; color: #0f172a;">{{ $claim->folio }}</h3>
                        </td>
                        <td align="right">
                            <span class="badge-success">Recibido</span>
                        </td>
                    </tr>
                </table>
            </div>

            <h4 style="color: #64748b; text-transform: uppercase; font-size: 12px; margin-bottom: 10px;">Premio Seleccionado</h4>
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

            <h4 style="color: #64748b; text-transform: uppercase; font-size: 12px; margin-bottom: 10px; margin-top: 30px;">Dirección de Entrega</h4>
            <p style="margin: 0; color: #0f172a;"><strong>{{ $claim->shipping_street }}</strong></p>
            <p style="margin: 0; color: #64748b;">Colonia {{ $claim->shipping_colonia }}, {{ $claim->shipping_city }}, {{ $claim->shipping_state }}</p>
            <p style="margin: 0; color: #64748b;">C.P. {{ $claim->shipping_zip }}</p>

            <p style="margin-top: 30px; font-size: 14px; text-align: center; color: #64748b;">
                Si tienes alguna duda sobre tu envío, por favor contáctanos mencionando tu folio.
            </p>
        </div>
        <div class="footer">
            <p>Este es un correo automático generado por {{ config('app.name', 'el Programa de Incentivos') }}. Por favor, no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>