const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const app = express();

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

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para agregar un usuario
app.post('/usuarios', (req, res) => {
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

    const sqlCheck = `SELECT * FROM ${tableName} WHERE email = ?`;
    db.get(sqlCheck, [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos: ' + err.message });
        }
        if (row) {
            return res.status(409).json({ error: 'El usuario ya existe.' });
        } else {
            const sqlInsert = `INSERT INTO ${tableName} (nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?)`;
            db.run(sqlInsert, [nombre, apellido, email, password, rol], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al agregar el usuario: ' + err.message });
                }
                res.json({ message: 'Usuario agregado con éxito', id: this.lastID });
            });
        }
    });
});

// Endpoint para obtener todos los usuarios
app.get('/usuarios', (req, res) => {
    const sql = `
        SELECT id, nombre, apellido, email, rol FROM usuarios
        UNION ALL
        SELECT id, nombre, apellido, email, rol FROM administradores
        UNION ALL
        SELECT id, nombre, apellido, email, rol FROM recepcionistas`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos: ' + err.message });
        }
        res.json(rows);
    });
});

// Endpoint para eliminar un usuario
app.delete('/usuarios/:id', (req, res) => {
    const id = req.params.id;

    const sqlSelect = `
        SELECT 'usuarios' as tableName FROM usuarios WHERE id = ?
        UNION ALL
        SELECT 'administradores' as tableName FROM administradores WHERE id = ?
        UNION ALL
        SELECT 'recepcionistas' as tableName FROM recepcionistas WHERE id = ?`;

    db.get(sqlSelect, [id, id, id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos: ' + err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const tableName = row.tableName;
        const sqlDelete = `DELETE FROM ${tableName} WHERE id = ?`;
        db.run(sqlDelete, [id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar el usuario: ' + err.message });
            }
            res.json({ message: 'Usuario eliminado con éxito' });
        });
    });
});

// Endpoint para actualizar un usuario
app.put('/usuarios/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, email, password, rol } = req.body;

    const sqlSelect = `
        SELECT 'usuarios' as tableName FROM usuarios WHERE id = ?
        UNION ALL
        SELECT 'administradores' as tableName FROM administradores WHERE id = ?
        UNION ALL
        SELECT 'recepcionistas' as tableName FROM recepcionistas WHERE id = ?`;

    db.get(sqlSelect, [id, id, id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos: ' + err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const tableName = row.tableName;
        const sqlUpdate = `UPDATE ${tableName} SET nombre = ?, apellido = ?, email = ?, password = ?, rol = ? WHERE id = ?`;
        db.run(sqlUpdate, [nombre, apellido, email, password, rol, id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar el usuario: ' + err.message });
            }
            res.json({ message: 'Usuario actualizado con éxito' });
        });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
