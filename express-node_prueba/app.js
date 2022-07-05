// 1 - Invocamos a Express
const express = require('express');
const app = express();

// 2 - Seteamos a urlencoded para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// 3 - Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

// 4 - El directorio public
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname+'/public'));

// 5 - Establecemos el motor de plantillas ejs
app.set('view engine', 'ejs');

// 6 - Invocamos a bcryptjs para hasear las contraseñas
const bcryptjs = require('bcryptjs');

// 7 - Configuramos las variables de session
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));

// 8 - Invocamos al modulo de la BD
const connection = require('./database/db');
const { name } = require('ejs');

// 9 - Establecemos las rutas
app.get('/login', (req, res)=>{
    res.render('login');
})

app.get('/register', (req, res)=>{
    res.render('register');
})

// 10 - Registracion
app.post('/register', async (req, res)=>{
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET ?', {user:user, name:name, rol:rol, pass:passwordHaash}, async(error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('register',{
            alert: true,
            alertTitle: "Registration",
            alertMessage: "¡Succesful Registration!",
            alertIcon:'success',
            showConfirmButton:false,
            timer:1500,
            ruta:''
        });
    }
    });
})

// 11 - Autenticacion
app.post('/auth', async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    if(user && pass){
        connection.query('SELECT * FROM users WHERE user= ?', [user], async(error, results)=>{
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login',{
                    alert:true,
                    alertTitle: "Error",
                    alertMessage: "Usuario y/o password incorrectos",
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer:false,
                    ruta:'login'
                });
            }else{
                req.session.loggedIn = true;
                req.session.name = results[0].name
                res.render('login',{
                    alert:true,
                    alertTitle: "Conexion Exitosa",
                    alertMessage: "¡LOGIN CORRECTO!",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer:1500,
                    ruta:''
                });
            }
        })
    }else{
        res.render('login',{
            alert:true,
            alertTitle: "Advertencia",
            alertMessage: "¡Por favor ingresa un usuario y/o password!",
            alertIcon: "warning",
            showConfirmButton: true,
            timer:1500,
            ruta:'login'
        });
    }
})

// 12 - Autenticamos para las demas paginas
app.get('/', (req, res)=>{
    if(req.session.loggedIn){
        res.render('index', {
            login: true,
            name: req.session.name
        });
    }else{
        res.render('index', {
            login: false,
            name: 'Debe iniciar sesion'
        });
    }
})

app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000')
})