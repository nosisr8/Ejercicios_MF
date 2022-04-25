const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const auth = require("../auth");
const ObjectId = require('mongodb').ObjectId;

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const Cuenta = require('./Cuenta');
const User = require('../user/User');

// Listar todos los usuarios
router.get('/', auth, function (req, res) {
    Cuenta.find({}, function (err, cuentas) {
		if (err) return res.status(500).json({ mensage: "Hubo un problema al listar todas los cuentas." });
		let cuentasArray = cuentas.map( async function(c){
			let user = await User.findById(ObjectId(c.user).toString());
			return {
				id: c._id,
				name: c.name,
				tipo: c.tipo,
				nro_cuenta: c.nro_cuenta,
				monto: c.monto,
				user: {
					id: user._id,
					name: user.name,
					dni: user.dni
				}
			}
		})
		Promise.all(cuentasArray).then(result => res.status(200).json(result));
    });
});

module.exports = router;