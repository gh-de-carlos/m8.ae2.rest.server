// Abstract storage interface
export class StorageInterface {
    async create(data) {
        throw new Error('create method must be implemented');
    }

    async findAll() {
        throw new Error('findAll method must be implemented');
    }

    async findById(id) {
        throw new Error('findById method must be implemented');
    }

    async update(id, data) {
        throw new Error('update method must be implemented');
    }

    async delete(id) {
        throw new Error('delete method must be implemented');
    }

    async purge() {
        throw new Error('purge method must be implemented');
    }
}