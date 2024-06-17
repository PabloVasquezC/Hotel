const sqlite3 = require('sqlite3').verbose();

// Asegúrate de que la ruta a la base de datos sea correcta, especialmente si estás trabajando en un entorno diferente o si la estructura de carpetas cambia
let db = new sqlite3.Database('./hotel.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos.');
    }
});

// Cierra la base de datos al cerrar la aplicación
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Base de datos cerrada');
        process.exit(0);
    });
});

module.exports = db;
