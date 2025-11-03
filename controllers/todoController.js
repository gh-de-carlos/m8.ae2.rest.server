import { createStorage } from '../storage/StorageFactory.js';

// Get storage instance based on request type
function getStorage(req) {
    return createStorage(req.storageType);
}

export const todoController = {
    // GET /api/todos - Get all todos
    async getAll(req, res) {
        try {
            // Magic parameter for error simulation
            if (req.query.simulateError) {
                const errorCode = parseInt(req.query.simulateError) || 500;
                console.log(`[ERROR] Simulating ${errorCode} error via magic parameter`);
                return res.status(errorCode).json({
                    success: false,
                    statusCode: errorCode,
                    error: `Simulated ${errorCode} error via magic parameter`,
                    storage: req.storageType
                });
            }

            const storage = getStorage(req);
            const todos = await storage.findAll();
            
            res.status(200).json({
                success: true,
                statusCode: 200,
                data: todos,
                count: todos.length,
                storage: req.storageType
            });
        } catch (error) {
            console.error('Error getting todos:', error);
            res.status(500).json({
                success: false,
                statusCode: 500,
                error: 'Failed to retrieve todos',
                storage: req.storageType
            });
        }
    },

    // GET /api/todos/:id - Get todo by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            
            // Magic parameter for error simulation
            if (req.query.simulateError) {
                const errorCode = parseInt(req.query.simulateError) || 500;
                console.log(`[ERROR] Simulating ${errorCode} error via magic parameter`);
                return res.status(errorCode).json({
                    success: false,
                    statusCode: errorCode,
                    error: `Simulated ${errorCode} error via magic parameter`,
                    storage: req.storageType
                });
            }

            const storage = getStorage(req);
            const todo = await storage.findById(id);

            if (!todo) {
                return res.status(404).json({
                    success: false,
                    statusCode: 404,
                    error: 'Todo not found',
                    storage: req.storageType
                });
            }

            res.status(200).json({
                success: true,
                statusCode: 200,
                data: todo,
                storage: req.storageType
            });
        } catch (error) {
            console.error('Error getting todo by ID:', error);
            res.status(500).json({
                success: false,
                statusCode: 500,
                error: 'Failed to retrieve todo',
                storage: req.storageType
            });
        }
    },

    // POST /api/todos - Create new todo
    async create(req, res) {
        try {
            const { message, completed } = req.body;

            // Magic parameter for error simulation
            if (req.query.simulateError) {
                const errorCode = parseInt(req.query.simulateError) || 500;
                console.log(`[ERROR] Simulating ${errorCode} error via magic parameter`);
                return res.status(errorCode).json({
                    success: false,
                    statusCode: errorCode,
                    error: `Simulated ${errorCode} error via magic parameter`,
                    storage: req.storageType
                });
            }

            // Validation
            if (!message || typeof message !== 'string' || message.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    error: 'Message is required and must be a non-empty string',
                    storage: req.storageType
                });
            }

            // Validate completed field if provided
            if (completed !== undefined && typeof completed !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    error: 'Completed field must be a boolean value',
                    storage: req.storageType
                });
            }

            const storage = getStorage(req);
            const newTodo = await storage.create({ 
                message: message.trim(),
                completed: completed || false
            });

            res.status(201).json({
                success: true,
                statusCode: 201,
                data: newTodo,
                message: 'Todo created successfully',
                storage: req.storageType
            });
        } catch (error) {
            console.error('Error creating todo:', error);
            res.status(500).json({
                success: false,
                statusCode: 500,
                error: 'Failed to create todo',
                storage: req.storageType
            });
        }
    },

    // PUT /api/todos/:id - Update todo
    async update(req, res) {
        try {
            const { id } = req.params;
            const { message, completed } = req.body;

            // Magic parameter for error simulation
            if (req.query.simulateError) {
                const errorCode = parseInt(req.query.simulateError) || 500;
                console.log(`[ERROR] Simulating ${errorCode} error via magic parameter`);
                return res.status(errorCode).json({
                    success: false,
                    statusCode: errorCode,
                    error: `Simulated ${errorCode} error via magic parameter`,
                    storage: req.storageType
                });
            }

            // Validation - at least one field must be provided
            if (message === undefined && completed === undefined) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    error: 'At least one field (message or completed) must be provided for update',
                    storage: req.storageType
                });
            }

            // Validate message if provided
            if (message !== undefined && (typeof message !== 'string' || message.trim().length === 0)) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    error: 'Message must be a non-empty string',
                    storage: req.storageType
                });
            }

            // Validate completed field if provided
            if (completed !== undefined && typeof completed !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    error: 'Completed field must be a boolean value',
                    storage: req.storageType
                });
            }

            const updateData = {};
            if (message !== undefined) updateData.message = message.trim();
            if (completed !== undefined) updateData.completed = completed;

            const storage = getStorage(req);
            const updatedTodo = await storage.update(id, updateData);

            if (!updatedTodo) {
                return res.status(404).json({
                    success: false,
                    statusCode: 404,
                    error: 'Todo not found',
                    storage: req.storageType
                });
            }

            res.status(200).json({
                success: true,
                statusCode: 200,
                data: updatedTodo,
                message: 'Todo updated successfully',
                storage: req.storageType
            });
        } catch (error) {
            console.error('Error updating todo:', error);
            res.status(500).json({
                success: false,
                statusCode: 500,
                error: 'Failed to update todo',
                storage: req.storageType
            });
        }
    },

    // DELETE /api/todos/:id - Delete todo
    async delete(req, res) {
        try {
            const { id } = req.params;

            // Magic parameter for error simulation
            if (req.query.simulateError) {
                const errorCode = parseInt(req.query.simulateError) || 500;
                console.log(`[ERROR] Simulating ${errorCode} error via magic parameter`);
                return res.status(errorCode).json({
                    success: false,
                    statusCode: errorCode,
                    error: `Simulated ${errorCode} error via magic parameter`,
                    storage: req.storageType
                });
            }

            const storage = getStorage(req);
            const deletedTodo = await storage.delete(id);

            if (!deletedTodo) {
                return res.status(404).json({
                    success: false,
                    statusCode: 404,
                    error: 'Todo not found',
                    storage: req.storageType
                });
            }

            res.status(200).json({
                success: true,
                statusCode: 200,
                data: deletedTodo,
                message: 'Todo deleted successfully',
                storage: req.storageType
            });
        } catch (error) {
            console.error('Error deleting todo:', error);
            res.status(500).json({
                success: false,
                statusCode: 500,
                error: 'Failed to delete todo',
                storage: req.storageType
            });
        }
    },

    // DELETE /api/todos/purge - Purge all data and reset sequences
    async purge(req, res) {
        try {
            // Magic parameter for error simulation
            if (req.query.simulateError) {
                const errorCode = parseInt(req.query.simulateError) || 500;
                console.log(`[ERROR] Simulating ${errorCode} error via magic parameter`);
                return res.status(errorCode).json({
                    success: false,
                    statusCode: errorCode,
                    error: `Simulated ${errorCode} error via magic parameter`,
                    storage: req.storageType
                });
            }

            const storage = getStorage(req);
            await storage.purge();

            res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'All todos purged and sequences reset',
                storage: req.storageType
            });
        } catch (error) {
            console.error('Error purging todos:', error);
            res.status(500).json({
                success: false,
                statusCode: 500,
                error: 'Failed to purge todos',
                storage: req.storageType
            });
        }
    },

    // GET /api/todos?id=:id - Get todo by ID using query parameter
    async getByIdQuery(req, res) {
        try {
            const { id } = req.query;

            // Validation
            if (!id) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    error: 'ID query parameter is required',
                    storage: req.storageType
                });
            }

            // Magic parameter for error simulation
            if (req.query.simulateError) {
                const errorCode = parseInt(req.query.simulateError) || 500;
                console.log(`[ERROR] Simulating ${errorCode} error via magic parameter`);
                return res.status(errorCode).json({
                    success: false,
                    statusCode: errorCode,
                    error: `Simulated ${errorCode} error via magic parameter`,
                    storage: req.storageType
                });
            }

            const storage = getStorage(req);
            const todo = await storage.findById(id);

            if (!todo) {
                return res.status(404).json({
                    success: false,
                    statusCode: 404,
                    error: 'Todo not found',
                    storage: req.storageType
                });
            }

            res.status(200).json({
                success: true,
                statusCode: 200,
                data: todo,
                storage: req.storageType
            });
        } catch (error) {
            console.error('Error getting todo by ID (query):', error);
            res.status(500).json({
                success: false,
                statusCode: 500,
                error: 'Failed to retrieve todo',
                storage: req.storageType
            });
        }
    },

    // DELETE /api/todos?id=:id - Delete todo using query parameter
    async deleteByQuery(req, res) {
        try {
            const { id } = req.query;

            // Validation
            if (!id) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    error: 'ID query parameter is required',
                    storage: req.storageType
                });
            }

            // Magic parameter for error simulation
            if (req.query.simulateError) {
                const errorCode = parseInt(req.query.simulateError) || 500;
                console.log(`[ERROR] Simulating ${errorCode} error via magic parameter`);
                return res.status(errorCode).json({
                    success: false,
                    statusCode: errorCode,
                    error: `Simulated ${errorCode} error via magic parameter`,
                    storage: req.storageType
                });
            }

            const storage = getStorage(req);
            const deletedTodo = await storage.delete(id);

            if (!deletedTodo) {
                return res.status(404).json({
                    success: false,
                    statusCode: 404,
                    error: 'Todo not found',
                    storage: req.storageType
                });
            }

            res.status(200).json({
                success: true,
                statusCode: 200,
                data: deletedTodo,
                message: 'Todo deleted successfully',
                storage: req.storageType
            });
        } catch (error) {
            console.error('Error deleting todo (query):', error);
            res.status(500).json({
                success: false,
                statusCode: 500,
                error: 'Failed to delete todo',
                storage: req.storageType
            });
        }
    }
};