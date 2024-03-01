const jwt = require('jsonwebtoken')
const UserModel = require('../modal/users.js')
// import UserModel from '../modal/users.js'
const encode = async (req , res , next) => {
    try{
        const { userName } = req.params;
        const user = await UserModel.getUserById(userName);
        const payload = {
            userId: user._id,
            userName: user.userName,
        };
        const authToken = jwt.sign(payload , secretKey(5));
        console.log('Auth Token : ',authToken);
        req.authToken = authToken;
        next();
    }catch(err){
        return res.status(400).json({success : false , message: err.error});
    }
 }
const decode = (req , res , next) => {
    if(!req.headers['authorization']) {
        return res.status(400).json({success : false , message: 'No access token provided'});
    }
    const accessToken = req.headers.authorization.split(' ')[1];
    try{
        const decoded = jwt.verify(accessToken , secretKey(5));
        req.userId = decoded.userId;
        req.userType = decoded.type;
        return next();
    }catch(err){
        return res.status(401).json({success: false , message : err.message});
    }
 }

 function secretKey(length) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}
