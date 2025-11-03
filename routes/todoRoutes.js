import express from 'express';
import { todoController } from '../controllers/todoController.js';

const router = express.Router();

// CRUD básico. Todos los endpoints retornan JSON

// GET /api/todos - Get all todos (or single todo with ?id= query param)
router.get('/', (req, res, next) => {
    // If id query parameter exists, use query-based controller
    if (req.query.id) {
        return todoController.getByIdQuery(req, res, next);
    }
    // Otherwise, get all todos
    return todoController.getAll(req, res, next);
});

// DELETE /api/todos/purge - Purge all todos and reset sequences (must be before /:id)
router.delete('/purge', todoController.purge);

// DELETE /api/todos?id=:id - Delete todo using query parameter
router.delete('/query', todoController.deleteByQuery);

// GET /api/todos/:id - Get todo by ID
router.get('/:id', todoController.getById);

// POST /api/todos - Create new todo
router.post('/', todoController.create);

// PUT /api/todos/:id - Update todo
router.put('/:id', todoController.update);

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', todoController.delete);

export default router;