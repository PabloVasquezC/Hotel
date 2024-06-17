const express = require('express');
const cors = require('cors');
const db = require('./database');
const app = express();

// Configuración CORS para permitir múltiples orígenes
const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // Habilitar CORS para solicitudes desde los orígenes permitidos
app.use(express.json()); // Middleware para parsear JSON

// Endpoint para agregar un usuario
app.post('/usuarios', (req, res) => {
    console.log('Recibido:', req.body);
    const { nombre, apellido, email, password, rol } = req.body;

    let tableName;
    switch (rol) {
        case 'administrador':
            tableName = 'administradores';
            break;
        case 'recepcionista':
            tableName = 'recepcionistas';
            break;
        default:
            tableName = 'usuarios';
            break;
    }
    console.log('Insertando en la tabla:', tableName);

    const sqlCheck = `SELECT * FROM ${tableName} WHERE email = ?`;
    db.get(sqlCheck, [email], (err, row) => {
        console.log('Usuario existe:', !!row);
        if (err) {
            console.error('Error en la consulta:', err.message);
            return res.status(500).json({ error: 'Error al consultar la base de datos: ' + err.message });
        }
        if (row) {
            return res.status(409).json({ error: 'El usuario ya existe.' });
        } else {
            const sqlInsert = `INSERT INTO ${tableName} (nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?)`;
            db.run(sqlInsert, [nombre, apellido, email, password, rol], function(err) {
                if (err) {
                    console.error('Error al insertar:', err.message);
                    return res.status(500).json({ error: 'Error al agregar el usuario: ' + err.message });
                }
                res.json({ message: 'Usuario agregado con éxito', id: this.lastID });
            });
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
