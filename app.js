let usuariosTotales;

async function consultas(name, nip) {
    if (name && nip) {
        connection.query('SELECT * FROM usuario WHERE name = ?', [name], async (error, results) => {
            if (results.length == 0 || !(await bcryptjs.compare(nip, results[0].nip))) {
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Usuario y/o nip incorrectos",
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            } else {
                req.session.name = results[0].name;
                req.session.dinero = results[0].dinero;
                res.render('login', {
                    alert: true,
                    alertTitle: "Conexion Exitosa",
                    alertMessage: "¡LOGIN CORRECTO!",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: 'menu'
                });
            }
        })
    } else {
        res.render('login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "¡Por favor ingresa un usuario y/o password!",
            alertIcon: "warning",
            showConfirmButton: true,
            timer: 1500,
            ruta: 'login'
        });
    }
}

// 1 - Invocamos a Express
const express = require('express');
const app = express();

// 2 - Seteamos a urlencoded para capturar los datos del formulario
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 3 - Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './VariablesEntorno/.env' });

// 4 - El directorio public o de access
app.use('/recursos', express.static('publico'));
app.use('/recursos', express.static(__dirname + '/publico'));

// 5 - Establecemos el motor de plantillas ejs
app.set('view engine', 'ejs');

// 6 - Invocamos a bcryptjs para hasear las contraseñas
const bcryptjs = require('bcryptjs');

// 7 - Configuramos las variables de session
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// 8 - Invocamos al modulo de la BD
const connection = require('./database/BDD');
const { name } = require('ejs');

// 9 - Establecemos las rutas
app.get('/', (req, res) => {
    res.render('inicio');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/menu', (req, res) => {
    res.render('menu');
})

app.get('/registro', (req, res) => {
    res.render('registro');
})

app.get('/index', (req, res) => {
    res.render('index');
})

app.get('/menu', (req, res) => {
    res.render('menu');
    consultas(req.session.name, req.session.nip);
})

app.get('/retiro', (req, res) => {
    res.render('retiro');
})

app.get('/deposito', (req, res) => {
    res.render('deposito');
})

app.get('/transaccion', (req, res) => {
    res.render('transaccion');
})

// 10 - Registracion
app.post('/registro', async (req, res) => {
    const name = req.body.name;
    const type = req.body.type;
    const nip = req.body.nip;
    const dinero = req.body.dinero;
    let nipHaash = await bcryptjs.hash(nip, 8);
    connection.query('INSERT INTO usuario SET ?', { name: name, type: type, nip: nipHaash, dinero: dinero }, async (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.render('registro', {
                alert: true,
                alertTitle: "Registration",
                alertMessage: "¡Succesful Registration!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: 'login'
            });
        }
    });
})

// 11 - Autenticacion
app.post('/auth', async (req, res) => {
    req.session.name = req.body.name;
    req.session.nip = req.body.nip;
    console.log(req.session.name);
    console.log(req.session.nip);
    let nipHaash = await bcryptjs.hash(req.session.nip, 8);
    if (req.session.name && req.session.nip) {
        
        connection.query('SELECT * FROM usuario', async(error, results)=>{
            usuariosTotales= results
            console.log(usuariosTotales.length)
        })
        
        connection.query('SELECT * FROM usuario WHERE name = ?', [req.session.name], async (error, results) => {
            if (results.length == 0 || !(await bcryptjs.compare(req.session.nip, results[0].nip))) {
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Usuario y/o nip incorrectos",
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            } else {
                req.session.loggedIn = true;
                req.session.name = results[0].name;
                req.session.dinero = results[0].dinero;
                res.render('login', {
                    alert: true,
                    alertTitle: "Conexion Exitosa",
                    alertMessage: "¡LOGIN CORRECTO!",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: 'menu'
                });
            }
        })
    } else {
        res.render('login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "¡Por favor ingresa un usuario y/o password!",
            alertIcon: "warning",
            showConfirmButton: true,
            timer: 1500,
            ruta: 'login'
        });
    }
})

// 13 - Depositos
app.post('/depot', async (req, res) => {
    const name = req.body.name;
    const consulta = "SELECT * FROM `usuario` WHERE name= " + name + '"';
    const dinero = req.body.dinero;
    const nip = req.body.nip;
    let dineroG = req.session.dinero;
    console.log(dineroG, " = ", dinero);
    let dineroF = parseFloat(dineroG) + parseFloat(dinero);
    console.log(dineroF)
    const queryUpdate = "UPDATE `usuario` SET dinero=" + dineroF + ' WHERE name= "' + name + '"';
    connection.query(queryUpdate, [dinero], async (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.render('login', {
                alert: true,
                alertTitle: "Deposito Realizado",
                alertMessage: "¡Succesful Registration!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: 'login'
            });
        }
    })

})

//14 - Retiro
app.post('/retiro', (req, res) => {
    const name = req.body.name
    const dinero = req.body.dinero
    const dineroBD = req.session.dinero
    let dineroBDI = parseFloat(dineroBD)
    let dineroP = parseFloat(dinero)
    if (dineroBD > dineroP) {
        let dineroF = dineroBDI - dineroP
        const queryUpdate = "UPDATE `usuario` SET dinero=" + dineroF + ' WHERE name= "' + name + '"';
        connection.query(queryUpdate, [dinero], async (error, results) => {
            if (error) {
                console.log(error);
            } else {
                res.render('login', {
                    alert: true,
                    alertTitle: "Deposito Realizado",
                    alertMessage: "¡Succesful Registration!",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: 'login'
                });
            }
        })
    } else {
        res.render('deposito', {
            alert: true,
            alertTitle: "No cuentas con el saldo suficiente",
            alertMessage: "¡Dinero Insuficiente!",
            alertIcon: 'Warning',
            showConfirmButton: false,
            timer: 1500,
            ruta: 'login'
        })
    }
})

// 14 - Transaccion
app.post('/trans', async(req, res)=>{
    let i = 0;
    const name = req.body.name
    const nip = req.body.nip
    const dinero = req.body.dinero
    let dineroBD = req.session.dinero
    let dineroF = parseFloat(dinero)
    let dineroBDF = parseFloat(dineroBD);
    if(dineroBDF > dineroF){
        for(i = 0; i < usuariosTotales.length; i++){
            if(usuariosTotales[i].name == name){
                console.log("Soy el dinero del que envia: " + req.session.dinero)
                console.log("Soy el dinero del que recibe: " + usuariosTotales[i].dinero)
                req.session.dinero = parseFloat(req.session.dinero) - parseFloat(dinero);
                usuariosTotales[i].dinero = parseFloat(usuariosTotales[i].dinero)+parseFloat(dinero)
                console.log("Despues Soy el dinero del que envia: " + req.session.dinero)
                console.log("Soy el dinero del que recibe: " + usuariosTotales[i].dinero)
                const queryUpdate = "UPDATE `usuario` SET dinero=" + req.session.dinero + ' WHERE name= "' + req.session.name + '"';
                
                const queryUpdate2 = "UPDATE `usuario` SET dinero=" + usuariosTotales[i].dinero + ' WHERE name= "' + usuariosTotales[i].name + '"';
                connection.query(queryUpdate, async(error, results)=>{
                    console.log("Query 1 extioso")
                })
                connection.query(queryUpdate2, async(error, results)=>{
                    console.log("Query 2 extioso")
                })
                
            }else{
                
            }
        }
    }else{
        
    }
})

// 12 - Autenticamos para las demas paginas
app.get('/saldo', (req, res) => {
    if (req.session.loggedIn) {
        res.render('saldo', {
            login: true,
            name: req.session.name,
            dinero: req.session.dinero
        });
    } else {
        res.render('saldo', {
            login: false,
            name: 'Debe iniciar sesion'
        });
    }
})

app.listen(3000, (req, res) => {
    console.log('Servidor corriendo en http://localhost:3000')
});