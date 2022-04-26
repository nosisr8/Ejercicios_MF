const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cuentaSchema = new Schema({
  	name: { type: String },
	tipo: { type: String },
	nro_cuenta: { type: Number },
	monto: { type: Number },
	user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
	trans_token: { type: Number },
	trans_date:  { type: Date }
});

cuentaSchema.statics.generateAccount = function(idUser) {
	Cuenta.create({
		name: 'Cuenta de Ahorro',
		tipo: 'AHO',
		nro_cuenta: Math.floor((Math.random() * 999999) + 1),
		monto: 0,
		user: idUser
	}, 
	function (err, cuenta) {
		if (err) return null;
		return cuenta;
	});
};

const Cuenta = mongoose.model("Cuenta", cuentaSchema);

module.exports = Cuenta;