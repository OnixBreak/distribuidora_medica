const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

const promise = connection.promise();
connection.connect((error)=>{
    if(error){
        console.log('El error de conexión es: '+error );
        return;
    }
    console.log('conectado a la base de datos!')
})
module.exports = connection;
