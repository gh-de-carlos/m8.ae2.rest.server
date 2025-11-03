export function getRootResponse(storageType) {
    return {
        message: 'Hola desde el M8 AE2 REST Server - Todos API!! 👋😁',
        version: '1.0.0, mejora del server RESTful "saludos".',
        statusCode: 200,
        storage: storageType,
        endpoints: {
            crud_by_param: {
                descripcion: "Endpoints CRUD usando parámetros de ruta (/todos/:id)",
                endpoints: [
                    'GET /api/todos/:id - Obtiene una tarea específica por ID',
                    'PUT /api/todos/:id - Actualiza una tarea específica por ID',
                    'DELETE /api/todos/:id - Elimina una tarea específica por ID'
                ]
            },
            crud_by_query: {
                descripcion: "Endpoints CRUD usando query parameters (/todos?id=123)",
                endpoints: [
                    'GET /api/todos?id=:id - Obtiene una tarea específica por query param',
                    'DELETE /api/todos/query?id=:id - Elimina una tarea específica por query param'
                ]
            },
            crud_general: {
                descripcion: "Endpoints CRUD generales para colecciones",
                endpoints: [
                    'GET /api/todos - Obtiene todas las tareas',
                    'POST /api/todos - Crea una nueva tarea'
                ]
            },
            utilidades: [
                {
                    endpoint: 'DELETE /api/todos/purge',
                    descripcion: 'Elimina todas las tareas y resetea las secuencias'
                },
                {
                    endpoint: 'GET /api/error',
                    descripcion: 'Simula un error 500 del servidor'
                },
                {
                    endpoint: '?simulateError=:code',
                    descripcion: 'Parámetro mágico para provocar errores en cualquier endpoint (ej: GET /api/todos?simulateError=404)'
                }
            ]
        }
    };
}