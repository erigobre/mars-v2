<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reactivación de Cuenta</title>
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
        .content {
            padding: 30px;
        }
        .password-box {
            background-color: #f1f5f9;
            border: 1px dashed #cbd5e1;
            padding: 15px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #0f172a;
            margin: 20px 0;
            border-radius: 4px;
            letter-spacing: 2px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Bienvenido de nuevo, {{ $user->username }}</h2>
        </div>
        <div class="content">
            <p>Hemos notado que tu cuenta ya estaba registrada en {{ config('app.name', 'nuestro Programa de Incentivos') }} bajo el distribuidor <strong>{{ $distributor->company_name }}</strong>, pero aún no habías iniciado sesión.</p>
            <p>Para facilitar tu acceso, aquí tienes las credenciales con las que tu distribuidor ha configurado tu ingreso:</p>
            
            <div class="password-box" style="font-size: 16px; text-align: left; padding: 20px;">
                <div style="margin-bottom: 10px;">
                    <span style="color: #64748b; font-size: 12px; text-transform: uppercase;">Distribuidor</span><br>
                    <strong>{{ $distributor->company_name }}</strong>
                </div>
                <div style="margin-bottom: 10px;">
                    <span style="color: #64748b; font-size: 12px; text-transform: uppercase;">{{ $identifierLabel }}</span><br>
                    <strong>{{ $identifier }}</strong>
                </div>
                <div>
                    <span style="color: #64748b; font-size: 12px; text-transform: uppercase;">{{ $credentialLabel }} (Contraseña)</span><br>
                    <strong>{{ $credential }}</strong>
                </div>
            </div>
            
            <p>Dependiendo de la configuración de tu distribuidor, es posible que no necesites usar tu correo electrónico directamente para iniciar sesión, sino los datos indicados en el recuadro anterior.</p>
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar a tu distribuidor o administrador.</p>
            
            <p>¡Mucho éxito en tus ventas!</p>
        </div>
        <div class="footer">
            <p>Este es un correo automático generado por {{ config('app.name', 'el Programa de Incentivos') }}. Por favor, no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>
