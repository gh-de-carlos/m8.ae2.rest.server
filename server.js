import express from 'express';
import dotenv from 'dotenv';
import todoRoutes from './routes/todoRoutes.js';
import { determineStorageType } from './config/determineStorage.js';
import { getRootResponse } from './utils/rootresponse.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Veamos que tipo de almacenamiento usaremos
const STORAGE_TYPE = determineStorageType();
console.log(`Starting server with ${STORAGE_TYPE} storage...`);

// 2. Middleware JSON
app.use(express.json());

// 3. Se agrega el tipo de almacenamiento al objeto
// request para que los controladores lo usen.
app.use((req, res, next) => {
    req.storageType = STORAGE_TYPE;
    next();
});

// 4. Casi todas las rutas de la API (el recurso '/todos')
app.use('/api/todos', todoRoutes);

// 5. Un error 500 simulado
app.get('/api/error', (req, res) => {
    console.log('[ERROR] Simulating 500 error');
    
    res.status(500).json({
        success: false,
        statusCode: 500,
        error: 'Internal Server Error - Simulated server failure',
        storage: STORAGE_TYPE,
        timestamp: new Date().toISOString()
    });
});

// 6. El raíz ('/') para saludar y documentar la API
app.get('/', (req, res) => {
    res.json(getRootResponse(STORAGE_TYPE));
});

// 7. Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false,
        statusCode: 500,
        error: 'Internal server error',
        storage: req.storageType || STORAGE_TYPE
    });
});

// 8. El handler 404
app.use('/{*splat}', (req, res) => {
    res.status(404).json({ 
        success: false,
        statusCode: 404,
        error: 'Route not found',
        storage: req.storageType || STORAGE_TYPE
    });
});

// 9. Iniciamos el server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Storage mode: ${STORAGE_TYPE}`);
    console.log('Use --database or --db flag to enable database storage');
});

// 10. Solo por buena práctica.
export default app;