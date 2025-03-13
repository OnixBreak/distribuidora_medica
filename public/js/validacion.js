document.getElementById('form_login').addEventListener('submit', async function (e) {
    e.preventDefault();

    const user = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    const response = await fetch('/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user, password })
    });

    const mensajeError = document.getElementById('mensaje-error');

    if (!response.ok) {
        const errorText = await response.text();
        mensajeError.textContent = errorText;
        mensajeError.style.display = 'block';
        document.getElementById('password').value = '';
    } else {
        window.location.href = '/'; 
    }
});