import fs from 'fs/promises';
import path from 'path';
import { StorageInterface } from './StorageInterface.js';

// Static flag to track global initialization
let globalInitialized = false;

export class FileStorage extends StorageInterface {
    constructor() {
        super();
        this.dataFile = path.join(process.cwd(), 'data', 'todos.json');
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
        this.initializing = this.ensureDataDirectory();
        await this.initializing;
        globalInitialized = true;
        this.initializing = null;
    }

    async ensureDataDirectory() {
        try {
            const dataDir = path.dirname(this.dataFile);
            await fs.mkdir(dataDir, { recursive: true });
            
            // Check if file exists, if not create empty array
            try {
                await fs.access(this.dataFile);
                // Validate existing JSON
                const data = await fs.readFile(this.dataFile, 'utf8');
                JSON.parse(data); // This will throw if JSON is invalid
            } catch {
                await fs.writeFile(this.dataFile, JSON.stringify([], null, 2));
            }
            console.log('[INIT] File storage initialized');
        } catch (error) {
            console.error('Error ensuring data directory:', error);
            throw error;
        }
    }

    async readData() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading data:', error);
            return [];
        }
    }

    async writeData(data) {
        try {
            await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing data:', error);
            throw error;
        }
    }

    async create(todoData) {
        await this.ensureInitialized();
        const todos = await this.readData();
        const newTodo = {
            id: Date.now().toString(),
            message: todoData.message,
            completed: todoData.completed || false,
            createdAt: new Date().toISOString()
        };
        todos.push(newTodo);
        await this.writeData(todos);
        
        console.log(`[CREATE] New todo: "${newTodo.message}" (ID: ${newTodo.id})`);
        return newTodo;
    }

    async findAll() {
        await this.ensureInitialized();
        const todos = await this.readData();
        console.log(`[READ] Retrieved ${todos.length} todo(s) from file storage`);
        return todos;
    }

    async findById(id) {
        await this.ensureInitialized();
        const todos = await this.readData();
        const todo = todos.find(todo => todo.id === id);
        
        if (!todo) {
            console.log(`[READ] Todo with ID ${id} not found`);
            return null;
        }
        
        console.log(`[READ] Found todo: "${todo.message}" (ID: ${todo.id})`);
        return todo;
    }

    async update(id, todoData) {
        await this.ensureInitialized();
        const todos = await this.readData();
        const index = todos.findIndex(todo => todo.id === id);
        
        if (index === -1) {
            console.log(`[UPDATE] Todo with ID ${id} not found for update`);
            return null;
        }

        // Build update info
        const updatedFields = [];
        if (todoData.message !== undefined) updatedFields.push('message');
        if (todoData.completed !== undefined) updatedFields.push('completed');

        todos[index] = {
            ...todos[index],
            message: todoData.message !== undefined ? todoData.message : todos[index].message,
            completed: todoData.completed !== undefined ? todoData.completed : todos[index].completed,
            updatedAt: new Date().toISOString()
        };

        await this.writeData(todos);
        
        const statusText = todos[index].completed ? "DONE" : "PENDING";
        const fieldsText = updatedFields.join(' + ');
        console.log(`[UPDATE] Updated ${fieldsText}: "${todos[index].message}" (ID: ${todos[index].id}) [${statusText}]`);
        return todos[index];
    }

    async delete(id) {
        await this.ensureInitialized();
        const todos = await this.readData();
        const index = todos.findIndex(todo => todo.id === id);
        
        if (index === -1) {
            console.log(`[DELETE] Todo with ID ${id} not found for deletion`);
            return null;
        }

        const deletedTodo = todos[index];
        todos.splice(index, 1);
        await this.writeData(todos);
        
        console.log(`[DELETE] Deleted todo: "${deletedTodo.message}" (ID: ${deletedTodo.id})`);
        return deletedTodo;
    }

    async purge() {
        try {
            await this.ensureInitialized();
            await this.writeData([]);
            console.log('[PURGE] All todos purged from file storage - fresh start!');
            return { message: 'All todos purged successfully' };
        } catch (error) {
            console.error('Error purging todos:', error);
            throw error;
        }
    }
}