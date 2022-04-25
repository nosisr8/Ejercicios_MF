const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const auth = require("../auth");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const User = require('./User');
const Cuenta = require('../cuenta/Cuenta');

// Agregar usuarios
router.post('/', function (req, res) {
	User.findOne({ dni: req.body.dni }, function (err, user) {
		if (err) return res.status(500).json({ mensage: "Hubo un problema al buscar usuario." });
		if (!user){
			User.create({
				name : req.body.name,
				dni : req.body.dni,
				password : req.body.password
			}, 
			async function (err, user) {
				if (err) return res.status(500).json({ mensage: "Hubo un problema al insertar el usuario." });
				const genCuenta = await Cuenta.generateAccount(user._id);
				res.status(201).json({
					name: user.name,
					dni: user.dni,
					password: user.password
				});
			});
		}else{
			return res.status(200).json({ mensage: "Usuario ya existente." });
		}
	})
});

// Listar todos los usuarios
router.get('/', auth, function (req, res) {
    User.find({}, function (err, users) {
		if (err) return res.status(500).json({ mensage: "Hubo un problema al listar todos los usuarios." });
		let usersArray = [];
		for(let u in users){
			let data = {
				id: users[u]._id,
				name: users[u].name,
				dni: users[u].dni,
				password: users[u].password
			};
			usersArray.push(data);
		}
		res.status(200).json(usersArray);
    });
});

// Listar usuario por ID
router.get('/user/:id', auth, function (req, res) {
    User.findById(req.params.id, function (err, user) {
		if (err) return res.status(500).json({ mensage: "Hubo un problema al listar el usuario." });
		if (!user) return res.status(404).json({ mensage: "Usuario no encontrado." });
		res.status(200).json({
			name: user.name,
			dni: user.dni,
			password: user.password
		});
    });
});

//Datos del usuario logueado
router.get("/me", auth, function(req, res) {
  res.send(req.user);
});


// Acceder
router.post("/login", async function(req, res) {
  try {
    const user = await User.checkCrediantialsDb(
      req.body.dni,
      req.body.password
    );
    //const message = await user.message;
    if (user) {
      const token = await user.generateAuthToken();
      res.status(201).json({
        token: token,
        name: user.name,
        id: user._id
      });
    } else {
      res.json({ message: "Credenciales invalidas." });
    }
  } catch (e) {
    console.log(e);
  }
});

// Cerrar Session
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status("201").json({
      message: "Success"
    });
  } catch (e) {
    res.status(500).send();
  }
});

// Eliminar usuario por ID
router.delete('/:id', auth, function (req, res) {
	User.findById(req.params.id, function (err, user) {
		if (err) return res.status(500).json({ mensage: "Hubo un problema al listar el usuario." });
		if (!user) return res.status(404).json({ mensage: "Usuario no encontrado." });
		User.findByIdAndRemove(req.params.id, function (err, user) {
			if (err) return res.status(500).json({ mensage: "Hubo un problema al eliminar el usuario." });
			res.status(200).json({ mensage: "Usuario: "+ user.name +" eliminado correctamente." });
		});
    });
    
});

// Modificar datos del usuario por ID
router.put('/:id', auth, function (req, res) {
	User.findById(req.params.id, function (err, user) {
		if (err) return res.status(500).json({ mensage: "Hubo un problema al listar el usuario." });
		if (!user) return res.status(404).json({ mensage: "Usuario no encontrado." });
		User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, user) {
			if (err) return res.status(500).json({ mensage: "Hubo un problema al edita el usuario." });
			res.status(200).json({
				name: user.name,
				dni: user.dni,
				password: user.password
			});
		});
    });
});

module.exports = router;