import pkg from 'pg';
import { StorageInterface } from './StorageInterface.js';

const { Pool } = pkg;

// Static flag to track global initialization
let globalInitialized = false;

export class PostgresStorage extends StorageInterface {
    constructor() {
        super();
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 5432,
        });
        
        this.initialized = false;
        this.initializing = null;
    }

    async ensureInitialized() {
        if (globalInitialized) {
            return;
        }

        // If already initializing, wait for it to complete
        if (this.initializing) {
            return await this.initializing;
        }

        // Start initialization
        this.initializing = this.initializeTable();
        await this.initializing;
        globalInitialized = true;
        this.initializing = null;
    }

    async initializeTable() {
        try {
            const client = await this.pool.connect();
            
            // Create todos table if it doesn't exist
            await client.query(`
                CREATE TABLE IF NOT EXISTS todos (
                    id SERIAL PRIMARY KEY,
                    message TEXT NOT NULL,
                    completed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create function if it doesn't exist
            await client.query(`
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ language 'plpgsql';
            `);

            // Drop and recreate trigger safely
            await client.query(`
                DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
            `);

            await client.query(`
                CREATE TRIGGER update_todos_updated_at
                    BEFORE UPDATE ON todos
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            `);

            client.release();
            console.log('[INIT] PostgreSQL database initialized successfully! Ready to rock!');
        } catch (error) {
            // Don't throw on concurrent initialization conflicts
            if (error.code === 'XX000' && error.message.includes('tuple concurrently updated')) {
                console.log('[INIT] Database already initialized by another instance - all good!');
                return;
            }
            console.error('Error initializing PostgreSQL database:', error);
            throw error;
        }
    }

    async create(todoData) {
        try {
            await this.ensureInitialized();
            const client = await this.pool.connect();
            
            const query = `
                INSERT INTO todos (message, completed)
                VALUES ($1, $2)
                RETURNING id, message, completed, created_at, updated_at
            `;
            
            const values = [todoData.message, todoData.completed || false];
            const result = await client.query(query, values);
            
            client.release();
            
            const newTodo = {
                id: result.rows[0].id.toString(),
                message: result.rows[0].message,
                completed: result.rows[0].completed,
                createdAt: result.rows[0].created_at,
                updatedAt: result.rows[0].updated_at
            };
            
            console.log(`[CREATE] New todo: "${newTodo.message}" (ID: ${newTodo.id})`);
            return newTodo;
        } catch (error) {
            console.error('Error creating todo:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            await this.ensureInitialized();
            const client = await this.pool.connect();
            
            const query = `
                SELECT id, message, completed, created_at, updated_at
                FROM todos
                ORDER BY created_at DESC
            `;
            
            const result = await client.query(query);
            client.release();
            
            const todos = result.rows.map(row => ({
                id: row.id.toString(),
                message: row.message,
                completed: row.completed,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }));
            
            console.log(`[READ] Retrieved ${todos.length} todo(s) from database`);
            return todos;
        } catch (error) {
            console.error('Error finding all todos:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            await this.ensureInitialized();
            
            // Validate that id is a valid number
            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                return null; // Return null for invalid IDs instead of throwing error
            }
            
            const client = await this.pool.connect();
            
            const query = `
                SELECT id, message, completed, created_at, updated_at
                FROM todos
                WHERE id = $1
            `;
            
            const result = await client.query(query, [numericId]);
            client.release();
            
            if (result.rows.length === 0) {
                console.log(`[READ] Todo with ID ${id} not found`);
                return null;
            }
            
            const row = result.rows[0];
            const todo = {
                id: row.id.toString(),
                message: row.message,
                completed: row.completed,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };
            
            console.log(`[READ] Found todo: "${todo.message}" (ID: ${todo.id})`);
            return todo;
        } catch (error) {
            console.error('Error finding todo by id:', error);
            throw error;
        }
    }

    async update(id, todoData) {
        try {
            await this.ensureInitialized();
            
            // Validate that id is a valid number
            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                return null; // Return null for invalid IDs
            }
            
            const client = await this.pool.connect();
            
            // Build dynamic query based on provided fields
            const updateFields = [];
            const values = [];
            let paramIndex = 1;
            
            if (todoData.message !== undefined) {
                updateFields.push(`message = $${paramIndex}`);
                values.push(todoData.message);
                paramIndex++;
            }
            
            if (todoData.completed !== undefined) {
                updateFields.push(`completed = $${paramIndex}`);
                values.push(todoData.completed);
                paramIndex++;
            }
            
            // Add the id parameter
            values.push(numericId);
            
            const query = `
                UPDATE todos
                SET ${updateFields.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING id, message, completed, created_at, updated_at
            `;
            
            const result = await client.query(query, values);
            client.release();
            
            if (result.rows.length === 0) {
                console.log(`[UPDATE] Todo with ID ${numericId} not found for update`);
                return null;
            }
            
            const row = result.rows[0];
            const updatedTodo = {
                id: row.id.toString(),
                message: row.message,
                completed: row.completed,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };
            
            // Build update info
            const updatedFields = [];
            if (todoData.message !== undefined) updatedFields.push('message');
            if (todoData.completed !== undefined) updatedFields.push('completed');
            
            const statusText = updatedTodo.completed ? "DONE" : "PENDING";
            const fieldsText = updatedFields.join(' + ');
            console.log(`[UPDATE] Updated ${fieldsText}: "${updatedTodo.message}" (ID: ${updatedTodo.id}) [${statusText}]`);
            return updatedTodo;
        } catch (error) {
            console.error('Error updating todo:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            await this.ensureInitialized();
            
            // Validate that id is a valid number
            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                return null; // Return null for invalid IDs
            }
            
            const client = await this.pool.connect();
            
            const query = `
                DELETE FROM todos
                WHERE id = $1
                RETURNING id, message, completed, created_at, updated_at
            `;
            
            const result = await client.query(query, [numericId]);
            client.release();
            
            if (result.rows.length === 0) {
                console.log(`[DELETE] Todo with ID ${numericId} not found for deletion`);
                return null;
            }
            
            const row = result.rows[0];
            const deletedTodo = {
                id: row.id.toString(),
                message: row.message,
                completed: row.completed,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };
            
            console.log(`[DELETE] Deleted todo: "${deletedTodo.message}" (ID: ${deletedTodo.id})`);
            return deletedTodo;
        } catch (error) {
            console.error('Error deleting todo:', error);
            throw error;
        }
    }

    async purge() {
        try {
            await this.ensureInitialized();
            const client = await this.pool.connect();
            
            // Delete all todos and reset sequence
            await client.query('DELETE FROM todos');
            await client.query('ALTER SEQUENCE todos_id_seq RESTART WITH 1');
            
            client.release();
            
            console.log('[PURGE] All todos purged and database reset - fresh start!');
            return { message: 'All todos purged and sequence reset successfully' };
        } catch (error) {
            console.error('Error purging todos:', error);
            throw error;
        }
    }

    async close() {
        await this.pool.end();
    }
}