const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const movimientoSchema = new Schema({
	cuenta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cuenta"
    },
  	concepto: { type: String },
	tipo: { type: String },
	monto: { type: Number },
	fecha: { type: Date },
	periodo: { type: String },
	cuenta_from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cuenta"
    },
});

const Movimiento = mongoose.model("Movimiento", movimientoSchema);

module.exports = Movimiento;