# M8 AE2 Creando un server REST

<small>Otra vez, pero más fome...</small>😝

Carlos Pizarro Morales.

## Contexto 

El propósito de esta actividad es que el/la estudiante entienda, construya y experimente con un servidor REST básico utilizando Express, manejando distintos tipos de peticiones HTTP, parámetros y respuestas con códigos personalizados.

## Instrucciones

### Parte 1: Servidor y rutas básicas [DONE]

- [x] Crea un servidor Express que escuche en un puerto definido (por ejemplo, 3000).
- [x] Agrega rutas que devuelvan una respuesta JSON para cada tipo de petición HTTP:
    - [x] `GET /api/saludo` → Retorna un saludo en formato JSON.
    - [x] `POST /api/usuario` → Retorna un mensaje confirmando creación.
    - [x] `PUT /api/usuario/:id` → Retorna un mensaje de actualización con el id.
    - [x] `DELETE /api/usuario/:id` → Retorna un mensaje de eliminación con el id.
- **NOTA:** Debido a que hemos estado trabajando mucho con API's RESTful incluso antes de esta actividad he implementado un recurso `/api/todo` que es más simpático de implementar. Miras las [notas](#notas) por más detalles.

### Parte 2: Parámetros y JSON [DONE]

- [x] Crea una ruta que reciba parámetros por URL (`req.params`) y los muestre en el JSON de respuesta.
- [x] Crea una ruta que reciba parámetros por query string (`req.query`) y los incluya en la respuesta.
- [x] Instala y usa ~~`body-parser`~~ (o `express.json()` moderno) para procesar parámetros en el cuerpo de una petición POST.

### Parte 3: Códigos de respuesta y validaciones [DONE]

- [x] En cada ruta, responde con el código HTTP adecuado:
    - [x] `200` para respuestas exitosas.
    - [x] `201` para creación.
    - [x] `400` para errores de validación.
    - [x] `404` si no se encuentra un recurso.
    - [x] `500` para errores de servidor simulados.
- [x] Crea un ejemplo donde se devuelva un código personalizado dependiendo de una condición (por ejemplo, si el usuario no tiene nombre).

## Notas

### Características Implementadas

He realizado uno pequeños cambios para mejorar la calidad del proyecto en relación a lo desafiante que puede ser:

1. En vez de hacer una micro api de RESTful de "saludos", he implementado una pequeña api de "tareas" (`/api/todos`). Esto, con la idea de que no fuera un ejercicio de hacer request a endpoints vacíos.
2. He utilizado almacenamiento, y en esta ocasión puedes elegir que sea en formato archivo, utilizando la librería `fs` de Node, o bien a través de una base de datos PostgreSQL, creando una bd de nombre `m8_rest_api`. Mira las instrucciones de instalación y uso abajo para más detalles.
3. También, aunque es una api mínima, he mantenido los principios de implementar una arquitectura en capas, muy afín a los principios RESTful. Particularmente, los archivos que manejan la configuración del almacenamiento `/storage` son muy entretenidos porque utilizan un patrón 'Factory' que permite entregar una instancia de almacenamiento de los controllers sin importar la opción con la que hayas iniciado el server.

Básicamente, tal como en mis últimas entregas, encontrarás una suite de tests aplicados exhaustivamente a cada endpoint creado. El único endpoint no cubierto es `route?simulateError=:code` que permite simular un error para cualquier endpoint agregando esta query que tiene el código http que queremos simular. No está ultra-completo, pero está muy bien para practicar cosas entretenidas. Mira la sección siguiente para saber como utilizar el script.

### Instalación y Uso

```bash
# Clona este repo:
git clone la-uri-de-tu-método-favorito

# Navegar al directorio (este)
cd tu_path/m8.ae2.rest.server

############## SI QUIERES TESTEAR ESTE EJERCICIO CON UNA BD ##############
##                                                                      ##
##                                                                      ##

## 1. Crea una bd en postgres                                           ##
sudo -i -u postgres
psql
## CREATE DATABASE m8_rest_api [WITH OWNER=opcional_tu_user_dedicado];  ##
## \q                                                                   ##
exit

## 2. Copia y modifica las variables de entorno                         ##
cp .env.example .env
## Modifica su contenido para ajustarse a tu entorno.                   ##

##                                                                      ##
##                                                                      ##
############## OMITE ESTOS PASOS ANTERIORES SI NO QUIERES USAR BD ########
############## LA APP HARÁ FALLBACK A ALMACENAMIENTO EN ARCHIVOS. ########
############## NO MODIFIQUES EL .env.example SI NO USARÁS BD.     ########


# Instalar dependencias
npm install

# Ya estás lista para jugar con este server. Solo tienes que elegir:
# Ejecutar servidor (detecta automáticamente según .env)
npm start                # PostgreSQL si .env configurado, sino archivo

# Forzar tipo de almacenamiento específico
npm run start:postgres   # Forzar PostgreSQL
npm run start:file       # Forzar archivo JSON

# Modo desarrollo con auto-reload
npm run dev          # Detecta automáticamente
npm run dev:postgres # Forzar PostgreSQL
npm run dev:file     # Forzar archivo JSON

# Estos comandos respectivamente corresponden a:
node server.js [ --watch ] [ --file | --postgres ]
```

### Lógica de Selección de Almacenamiento

El servidor determina el tipo de almacenamiento en este orden:

1. **Flag `--file`**: Fuerza almacenamiento en archivo JSON
2. **Flag `--postgres`**: Fuerza almacenamiento en PostgreSQL
3. **Sin flags**: Si `.env` configurado → PostgreSQL, sino → archivo JSON


### Correr la suite de pruebas

Las pruebas están en `test-api.sh`. Simplemente otórgale permisos de ejecución, inicia el servidor y luego invoca el script `./test-api.sh` para que comiencen los tests. El estilo está en desarrollo aún, pero por este proyecto, quedará así.

### Todos los endpoints de la API

#### Endpoints principales

- `GET /` → Información del servidor y lista de endpoints disponibles

#### Todos (Tareas)

**Obtener tareas:**

- `GET /api/todos` → Obtener todas las tareas
- `GET /api/todos?id=:id` → Obtener tarea específica usando query parameter
- `GET /api/todos/:id` → Obtener tarea específica usando route parameter

**Crear y modificar:**

- `POST /api/todos` → Crear nueva tarea
- `PUT /api/todos/:id` → Actualizar tarea existente

**Eliminar:**

- `DELETE /api/todos/:id` → Eliminar tarea específica usando route parameter
- `DELETE /api/todos/query?id=:id` → Eliminar tarea específica usando query parameter
- `DELETE /api/todos/purge` → Eliminar todas las tareas y resetear secuencias

#### Simulación de errores

- `GET /api/error` → Simula error 500 del servidor
- `?simulateError=:code` → Parámetro mágico para simular errores en cualquier endpoint (ej: `GET /api/todos?simulateError=404`)

### Ejemplos de Uso

#### Crear una nota

```bash
# Nota básica
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"message": "Estudiar para el examen"}'

# Nota completada
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"message": "Tarea terminada", "completed": true}'
```

#### Obtener todas las notas

```bash
curl http://localhost:3000/api/todos
```

#### Actualizar una nota

```bash
# Actualizar mensaje y estado
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"message": "Estudiar para el examen final", "completed": true}'

# Solo actualizar estado de completado
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Códigos de Respuesta HTTP

- `200` - Respuestas exitosas (GET, PUT, DELETE exitosos)
- `201` - Creación exitosa (POST)
- `400` - Errores de validación (datos faltantes/incorrectos)
- `404` - Recurso no encontrado
- `500` - Errores de servidor (simulados y reales)

### Estructura del Proyecto

```
├── server.js               # Servidor principal con configuración de flags
├── config/                 # Configuración del proyecto
│   └── determineStorage.js # Lógica de determinación de tipo de almacenamiento
├── controllers/            # Lógica de negocio
│   └── todoController.js   # Controladores para todos
├── routes/                 # Definición de rutas
│   └── todoRoutes.js       # Rutas de todos (incluye rutas básicas)
├── storage/                # Capa de almacenamiento
│   ├── StorageInterface.js # Contrato de la clase
│   ├── FileStorage.js      # Almacenamiento en JSON
│   ├── PostgresStorage.js  # Almacenamiento en PostgreSQL
│   └── StorageFactory.js   # Factoría de instancias de Storage
├── utils/                  # Utilidades del proyecto
│   └── rootresponse.js     # Respuesta estructurada para endpoint raíz
├── test-api.sh             # Script de pruebas completo con colores ANSI
├── .env.example            # Variables de entorno de ejemplo
└── data/                   # Directorio creado automáticamente (modo archivo)
    └── todos.json          # Archivo de datos JSON (solo si eliges --file)
```