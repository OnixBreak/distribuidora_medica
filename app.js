const express = require('express');
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');
const session = require('express-session');
const mysql = require('mysql2');
const cors = require('cors');
const util = require('util');

const app = express();

dotenv.config({ path: './env/.env' });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store'); // No almacenar en caché
    next();
});

function verificarSesion(req, res, next) {
    if (req.session.loggedin) {
        return next(); // Si está autenticado, sigue con la solicitud
    } else {
        return res.redirect('/login'); // Si no, redirige a login
    }
}

const query = util.promisify(connection.query).bind(connection);

app.get('/', verificarSesion, (req, res) => {
    res.render('index', { user: req.session.user }); // Pasar usuario a la vista
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    if (req.session.loggedin) {
        return res.redirect('/'); // Si ya está autenticado, lo manda a index
    }
    res.render('login'); // Si no, muestra el formulario de login
});




app.post('/auth', async (req, res) => {
    const { user, password } = req.body;

    if (!user || !password) {
        return res.status(400).send('Faltan datos');
    }

    try {
        const results = await query('SELECT * FROM usuarios WHERE user = ?', [user]);

        if (results.length === 0) {
            return res.status(401).send('USUARIO INCORRECTO');
        }

        const usuario = results[0];

        // Comparar la contraseña con el hash almacenado
        const passwordMatch = await bcryptjs.compare(password, usuario.password);

        if (!passwordMatch) {
            return res.status(401).send('PASSWORD INCORRECTO');
        }

        // Guardar sesión
        req.session.loggedin = true;
        req.session.user = usuario.usuario;

        res.redirect('/'); // 🔥 Redirigir a index después de iniciar sesión correctamente
    } catch (error) {
        console.error('Error en autenticación:', error);
        res.status(500).send('Error interno del servidor');
    }
});


app.post('/auth', async (req, res) => {
    let { user, password } = req.body;
    user = user.trim();
    password = password.trim();

    if (!user || !password) {
        return res.status(400).send('Faltan datos');
    }

    try {
        const results = await query('SELECT * FROM usuarios WHERE user = ?', [user]);

        if (results.length === 0) {
            console.log(`Usuario no encontrado: ${user}`);
            return res.status(401).send('USUARIO INCORRECTO');
        }

        const usuario = results[0];

        if (!usuario.password) {
            console.error('Error: La propiedad "password" no existe en la base de datos');
            return res.status(500).send('Error interno del servidor');
        }

        console.log("Comparando contraseña ingresada con hash en la DB");
        const passwordMatch = await bcryptjs.compare(password, usuario.password);

        if (!passwordMatch) {
            console.log("Contraseña incorrecta para usuario:", user);
            return res.status(401).send('PASSWORD INCORRECTO');
        }

        req.session.loggedin = true;
        req.session.user = user;

        res.send('Autenticación exitosa');
    } catch (error) {
        console.error('Error en autenticación:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.use(express.json());
app.use(cors());

const logoutRoutes = require('./routes/logout');
app.use('/api', logoutRoutes);

const clientesRoutes = require('./routes/clientes');
app.use('/api', clientesRoutes);

const consultClientesRoutes = require('./routes/consultClientes');
app.use('/api', consultClientesRoutes);


const deleteClienteRoutes = require('./routes/deleteCliente');
app.use('/api', deleteClienteRoutes);

const consultFolioRegistro = require('./routes/registros');
app.use('/api', consultFolioRegistro);

const foliosRoutes = require("./routes/folios"); // Importar las rutas

app.use("/api", foliosRoutes);


const consultregistrosRoutes = require('./routes/consultRegistros');
app.use('/api', consultregistrosRoutes);

const actClientRoutes = require('./routes/actClientes');
app.use('/api', actClientRoutes);


const consultregistedit = require('./routes/consultRegistEdit');
app.use('/api', consultregistedit);


app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});




/*
esto lo estoy usando para hashear las claves de los usuarios

const bcryptjs = require('bcryptjs');

async function generarHash() {
    const passwordPlano = 'system15'; // Cambia esto por la contraseña real
    const hash = await bcryptjs.hash(passwordPlano, 10);
    console.log('Hash generado:', hash);
}

generarHash();


*/