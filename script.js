document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('userForm');
    const userTable = document.getElementById('userTable').getElementsByTagName('tbody')[0];

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            rol: document.getElementById('rol').value
        };

        fetch('http://localhost:3000/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text || 'Algo salió mal en el servidor') });
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('message').textContent = 'Usuario agregado con éxito ID: ' + data.id;
            loadUsers(); // Recargar la lista de usuarios
        })
        .catch(error => {
            document.getElementById('message').textContent = 'Error al agregar usuario: ' + error.message;
        });
    });

    function loadUsers() {
        fetch('http://localhost:3000/usuarios')
            .then(response => response.json())
            .then(users => {
                userTable.innerHTML = '';
                users.forEach(user => {
                    const row = userTable.insertRow();
                    row.insertCell(0).textContent = user.id;
                    row.insertCell(1).textContent = user.nombre;
                    row.insertCell(2).textContent = user.apellido;
                    row.insertCell(3).textContent = user.email;
                    row.insertCell(4).textContent = user.rol;
                    const actionsCell = row.insertCell(5);
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Editar';
                    editButton.onclick = () => editUser(user);
                    actionsCell.appendChild(editButton);
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Eliminar';
                    deleteButton.className = 'delete';
                    deleteButton.onclick = () => deleteUser(user.id);
                    actionsCell.appendChild(deleteButton);
                });
            })
            .catch(error => {
                console.error('Error al cargar usuarios:', error);
            });
    }

    function deleteUser(userId) {
        fetch(`http://localhost:3000/usuarios/${userId}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text || 'Algo salió mal en el servidor') });
                }
                loadUsers(); // Recargar la lista de usuarios
            })
            .catch(error => {
                console.error('Error al eliminar usuario:', error);
            });
    }

    function editUser(user) {
        document.getElementById('nombre').value = user.nombre;
        document.getElementById('apellido').value = user.apellido;
        document.getElementById('email').value = user.email;
        document.getElementById('password').value = user.password;
        document.getElementById('rol').value = user.rol;

        form.onsubmit = function(e) {
            e.preventDefault();

            const updatedData = {
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                rol: document.getElementById('rol').value
            };

            fetch(`http://localhost:3000/usuarios/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text || 'Algo salió mal en el servidor') });
                }
                return response.json();
            })
            .then(data => {
                document.getElementById('message').textContent = 'Usuario actualizado con éxito ID: ' + data.id;
                loadUsers(); // Recargar la lista de usuarios
                form.reset(); // Reset the form to its original state
                form.onsubmit = form.addEventListener; // Restore the original form submission
            })
            .catch(error => {
                document.getElementById('message').textContent = 'Error al actualizar usuario: ' + error.message;
            });
        };
    }

    loadUsers(); // Cargar usuarios al iniciar
});
