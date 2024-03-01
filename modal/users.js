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

userSchema.statics.getUserById = async function (UName) {
    try{
        const user = await this.findOne({ userName : UName});
        if(!user) throw ({ error:"No User with this User Name found !!" });
        return user;
    }catch(error){
        throw error;
    }
}

const User = mongoose.model('user', userSchema);

module.exports = User;