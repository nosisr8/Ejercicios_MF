const express = require('express');
const app = express();
const db = require('./db');

const UserController = require('./user/UserController');
const CuentaController = require('./cuenta/CuentaController');
const MovimientoController = require('./movimiento/MovimientoController');
app.use('/users', UserController);
app.use('/cuentas', CuentaController);
app.use('/movimientos', MovimientoController);

module.exports = app;