document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('userForm');
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
        })
        .catch(error => {
            document.getElementById('message').textContent = 'Error al agregar usuario: ' + error.message;
        });
    });
});
