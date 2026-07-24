<?php

namespace App\Traits;

use App\Enums\ApiMessage;
use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    use TransformsCamelCase;

    protected function successResponse(
        ApiMessage|string $message,
        mixed $data = null,
        int $code = 200,
        array $replace = []
    ): JsonResponse {
        // Si es Enum, traducir
        $msg = $message instanceof ApiMessage 
            ? $message->message($replace) 
            : $message;

        $dataArray = is_object($data) ? (array) $data : $data;

        if (is_array($dataArray) && isset($dataArray['data']) && (isset($dataArray['links']) || isset($dataArray['meta']))) {
            $data = [
                'items' => $dataArray['data'],
                'links' => $dataArray['links'] ?? null,
                'meta'  => $dataArray['meta'] ?? null,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => $msg,
            'data' => $data,
        ], $code);
    }

    protected function errorResponse(
        ApiMessage|string $message,
        int $code = 400,
        mixed $errors = null,
        array $replace = []
    ): JsonResponse {
        $msg = $message instanceof ApiMessage 
            ? $message->message($replace) 
            : $message;

        $response = [
            'success' => false,
            'message' => $msg,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Devuelve un 201 Created con un mensaje de éxito y los datos del recurso creado. Útil para operaciones de creación.
     */
    protected function created(mixed $data, string $message = 'Recurso creado exitosamente')
    {
        return $this->successResponse($message, $data, 201);
    }

    /**
     *  Devuelve un 200 OK con un mensaje de éxito, pero sin datos. Útil para operaciones de eliminación o acciones que no necesitan retornar un recurso específico.
     */
    protected function deleted(string $message = 'Recurso eliminado exitosamente')
    {
        return $this->successResponse($message, null, 200);
    }

    /**
     * Devuelve un 404 Not Found con un mensaje personalizado. Útil para casos donde el recurso no existe o no se encuentra.
     */
    protected function notFound(string $message = 'Recurso no encontrado')
    {
        return $this->errorResponse($message, 404);
    }

    /**
     * Devuelve un 403 Forbidden con un mensaje personalizado. Útil para casos donde el usuario no tiene permisos para acceder al recurso o realizar la acción.
     */
    protected function forbidden(string $message = 'No autorizado')
    {
        return $this->errorResponse($message, 403);
    }

    /**
     * Devuelve un 422 Unprocessable Entity con un mensaje de error y detalles de validación. Útil para casos donde la entrada del usuario no cumple con las reglas de validación.
     */
    protected function validationError(array $errors)
    {
        $camelErrors = $this->camel($errors);
        return $this->errorResponse('Errores de validación', 422, $camelErrors);
    }
}