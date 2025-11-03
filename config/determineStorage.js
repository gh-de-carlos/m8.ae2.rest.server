// Utilizamos el flag pasado a node server.js --file o --postgres
// para determinar el tipo de almacenamiento.
export function determineStorageType() {
    // Con --file, el almacenamiento será de archivos en /data/todos.json
    if (process.argv.includes('--file')) {
        return 'file';
    }

    // Con --postgres, el almacenamiento será en una base de datos PostgreSQL
    if (process.argv.includes('--postgres')) {
        return 'postgres';
    }

    // Si no pasas flags: verificar variables .env, preferir postgres
    if (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST && process.env.DB_NAME) {
        return 'postgres';
    }

    // Fallback. No elegiste flag pero no tienes variables de entorno:
    // almacenamiento en archivos
    return 'file';
}