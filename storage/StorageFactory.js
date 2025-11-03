import { FileStorage } from './FileStorage.js';
import { PostgresStorage } from './PostgresStorage.js';

export function createStorage(storageType) {
    switch (storageType) {
        case 'postgres':
            return new PostgresStorage();
        case 'file':
            return new FileStorage();
        default:
            throw new Error(`Unknown storage type: ${storageType}`);
    }
}