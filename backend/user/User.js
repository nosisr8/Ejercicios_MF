const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;
const userSchema = new Schema({
	name: String,
	dni: String,
	password: String,
	tokens: [
		{
			token: {
				type: String,
				required: true
			}
		}
	]
});

userSchema.statics.checkCrediantialsDb = async (dni, password) => {
  	const user1 = await User.findOne({ dni: dni, password: password });
  	if (user1) {
		return user1;
  	}
};

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "mf-test", {});
  console.log(token);
  user.tokens = user.tokens.concat({ token: token });
  await user.save();
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;