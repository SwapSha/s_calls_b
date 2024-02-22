const mongoose = require('mongoose');
const uuidv4 = require('uuid');
const userSchema = new mongoose.Schema({
	_id: {
		type:String,
		default:()=> uuidv4.v4().replace(/\-/g,'')
	},
	firstName:String,
	lastName:String,
  	userName: String,
	passWord:String,
	profile: String,
  	timestamp: { type: Date, default: Date.now }
},{
	collection:"Users"
});

const User = mongoose.model('user', userSchema);

module.exports = User;