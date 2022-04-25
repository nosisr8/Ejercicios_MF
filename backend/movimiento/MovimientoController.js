const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const auth = require("../auth");
const moment = require('moment');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const Movimiento = require('./Movimiento');
const Cuenta = require('../cuenta/Cuenta');
const ErrorCode = [''];
// Consultar Movimientos
router.get('/', auth, function (req, res) {
   	Movimiento.find({}, function (err, movimientos) {
		if (err) return res.status(500).json({ mensage: "Hubo un problema al listar todos los movimientos." });
		res.status(200).json(movimientos.map(function(m){
			return {
				id: m._id,
				fecha: moment(m.fecha).format('DD/MM/YYYY'),
				hora: moment(m.fecha).format('HH:mm'),
				concepto: m.concepto,
				tipo: m.tipo == 'I' ? 'Haber' : 'Debe',
				monto: m.monto
			}
		}));
    });
});

// Consultar Movimiento por usuario
router.get('/me', auth, function (req, res) {
   	return res.status(200).json([]);
});

// Consultar Movimiento por usuario
router.get('/user/:idUser', function (req, res) {
   	return res.status(200).json([]);
});

// Depositar
router.post('/depositar', auth, function (req, res) {
	if (!isValue(req.body.nro_cuenta)) return res.status(400).json({ mensage: "Parametro nro_cuenta vacia." });
	if (!isValue(req.body.monto) && !isNumber(req.body.monto) && req.body.monto == '0') return res.status(400).json({ mensage: "Parametro monto vacio." });
	Cuenta.findOne({ nro_cuenta: req.body.nro_cuenta }, function (err, cuenta) {
		if (err) return res.status(500).json({ mensage: "Hubo un problema al buscar la cuenta." });
		if (!cuenta) return res.status(404).json({ mensage: "Cuenta no encontrada." });
		if (parseInt(req.body.monto) <= 0) return res.status(400).json({ mensage: "El monto no puede ser negativo." }); 
		const body = {
			monto: cuenta.monto + parseInt(req.body.monto)
		};
		Cuenta.findByIdAndUpdate(cuenta._id, body, {new: true}, function (err, updateUser) {
			if (err) return res.status(500).json({ mensage: "Hubo un problema al depositar." });
			Movimiento.create({
				cuenta: updateUser._id,
				concepto: 'Depósito',
				tipo: 'I',
				monto: parseInt(req.body.monto),
				fecha: moment(),
				periodo: moment().format('MM/YYYY')
			}, 
			function (err, movimiento) {
				if (err) return res.status(500).json({ mensage: "Hubo un problema al registrar el movimiento." });
				return res.status(200).json({ mensage: "Se ha depositado correctamente." });
			});
		});
    });
});

// Extraccion
router.post('/extraccion', function (req, res) {
   	if (!isValue(req.body.nro_cuenta)) return res.status(400).json({ mensage: "Parametro nro_cuenta vacia." });
	if (!isValue(req.body.monto) && !isNumber(req.body.monto) && req.body.monto == '0') return res.status(400).json({ mensage: "Parametro monto vacio." });
	Cuenta.findOne({ nro_cuenta: req.body.nro_cuenta }, function (err, cuenta) {
		if (err) return res.status(500).json({ mensage: "Hubo un problema al buscar la cuenta." });
		if (!cuenta) return res.status(404).json({ mensage: "Cuenta no encontrada." });
		if (parseInt(req.body.monto) <= 0) return res.status(400).json({ mensage: "El monto no puede ser negativo." });
		if (cuenta.monto < parseInt(req.body.monto)) return res.status(400).json({ mensage: "Lamentamos que su saldo es insuficiente para la extraccion." });
		const body = {
			monto: cuenta.monto - parseInt(req.body.monto)
		};
		Cuenta.findByIdAndUpdate(cuenta._id, body, {new: true}, function (err, updateUser) {
			if (err) return res.status(500).json({ mensage: "Hubo un problema al depositar." });
			Movimiento.create({
				cuenta: updateUser._id,
				concepto: 'Extracción',
				tipo: 'E',
				monto: parseInt(req.body.monto),
				fecha: moment(),
				periodo: moment().format('MM/YYYY')
			}, 
			function (err, movimiento) {
				console.log(err, movimiento);
				if (err) return res.status(500).json({ mensage: "Hubo un problema al registrar el movimiento." });
				return res.status(200).json({ mensage: "La extracción se ha realizado correctamente." });
			});
		});
    });
});

// Transferencia
router.post('/transferencia', function (req, res) {
   	return res.status(200).json([]);
});

const isValue = (value) => {
    if (value === undefined) return false;
    if (value === null) return false;
    if (value === 'null') return false;
    if (value === '') return false;
    return true;
}

const isNumber = (n) => { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

module.exports = router;