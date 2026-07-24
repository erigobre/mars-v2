<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>¡Tienes puntos disponibles en Frigolazo!</title>
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
        .points-box {
            background-color: #fef3c7;
            border: 2px solid #fbbf24;
            padding: 20px;
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #b45309;
            margin: 20px 0;
            border-radius: 8px;
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
        .btn {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>¡Hola, {{ $user->username }}!</h2>
        </div>
        <div class="content">
            <p>Tenemos excelentes noticias para ti de parte de <strong>{{ $distributor->company_name }}</strong> y <strong>Frigolazo</strong>. Gracias a tus ventas, has acumulado puntos que te están esperando.</p>
            
            <div class="points-box">
                ¡Tienes {{ number_format($points, 0) }} Puntos!
            </div>

            <p><strong>¿Qué puedes hacer con tus puntos?</strong></p>
            <p>¡Muchísimo! En la plataforma de Frigolazo puedes canjear tus puntos por increíbles premios. Tenemos desde electrodomésticos, tarjetas de regalo, hasta experiencias únicas. No dejes pasar la oportunidad de disfrutar lo que te has ganado con tu esfuerzo.</p>
            
            <p>Ingresa ahora mismo a nuestra plataforma, revisa nuestro catálogo de premios y elige tu recompensa. Aquí tienes tus datos de acceso en caso de que los necesites:</p>
            
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
            
            <div style="text-align: center;">
                <a href="{{ url('/') }}" class="btn">Ver Catálogo de Premios</a>
            </div>

            <p style="margin-top: 20px;">Dependiendo de la configuración de tu distribuidor, es posible que no necesites usar tu correo electrónico directamente para iniciar sesión, sino los datos indicados en el recuadro anterior.</p>
            <p>Anímate a usar la plataforma y descubre todo lo que hemos preparado para reconocer tu gran trabajo.</p>
            
            <p>¡Sigue vendiendo y ganando!</p>
        </div>
        <div class="footer">
            <p>Este es un correo automático generado por Frigolazo. Por favor, no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>
