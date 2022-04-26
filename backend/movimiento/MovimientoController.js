const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const auth = require("../auth");
const moment = require('moment');
const ObjectId = require('mongodb').ObjectId;

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const Movimiento = require('./Movimiento');
const Cuenta = require('../cuenta/Cuenta');

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
				concepto: 'Depรณsito',
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
router.post('/extraccion', auth, function (req, res) {
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
				concepto: 'Extracciรณn',
				tipo: 'E',
				monto: parseInt(req.body.monto),
				fecha: moment(),
				periodo: moment().format('MM/YYYY')
			}, 
			function (err, movimiento) {
				console.log(err, movimiento);
				if (err) return res.status(500).json({ mensage: "Hubo un problema al registrar el movimiento." });
				res.status(200).json({ mensage: "La extracciรณn se ha realizado correctamente." });
			});
		});
    });
});

// Transferencia
router.post('/transferencia', auth, async function (req, res) {
   	if (!isValue(req.body.cuenta_from)) return res.status(404).json({ mensage: "Parametro cuenta_from vacia." });
	if (!isValue(req.body.monto) && !isNumber(req.body.monto) && req.body.monto == '0') return res.status(404).json({ mensage: "Parametro monto vacio." });
	if (!isValue(req.body.trans_token) && !isNumber(req.body.trans_token)) return res.status(404).json({ mensage: "Token para transferencia invalido." });
	const cuenta = await Cuenta.findOne({user: ObjectId(req.user._id).toString()});
	const cuentaFrom = await Cuenta.findOne({ nro_cuenta: req.body.cuenta_from });
	if (!cuenta) return res.status(404).json({ mensage: "Cuenta no encontrada." });
	if (!cuentaFrom) return res.status(404).json({ mensage: "Cuenta no encontrada." });
	if (cuenta.trans_token != req.body.trans_token) return res.status(404).json({ mensage: "Token para transferencia invalido." });
	const currentDate = moment();
	let segundos = currentDate.diff(moment(cuenta.trans_date), 'seconds');
	if (segundos >= 60) return res.status(404).json({ mensage: "Token caducado solo valido por 60 segundos." });
	if (cuenta.monto < parseInt(req.body.monto)) return res.status(404).json({ mensage: "Lamentamos que su saldo es insuficiente para la transferencia." });
	const body = {
		monto: cuenta.monto - parseInt(req.body.monto)
	};
	const bodyFrom = {
		monto: cuentaFrom.monto + parseInt(req.body.monto)
	};
	await Cuenta.findByIdAndUpdate(cuenta._id, body, {new: true});
	await Cuenta.findByIdAndUpdate(cuentaFrom._id, bodyFrom, {new: true});
	await Movimiento.create({
		cuenta: cuenta._id,
		concepto: 'Transferencia entre cuentas',
		tipo: 'E',
		monto: parseInt(req.body.monto),
		fecha: moment(),
		periodo: moment().format('MM/YYYY')
	});
	await Movimiento.create({
		cuenta: cuentaFrom._id,
		concepto: 'Transferencia entre cuentas',
		tipo: 'I',
		monto: parseInt(req.body.monto),
		fecha: moment(),
		periodo: moment().format('MM/YYYY')
	});
	res.status(200).json({ mensage: "La trsnsferencia se ha realizado correctamente." });
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