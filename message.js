const mongoose = require("mongoose");
const uuidv4 = require('uuid');

const messageArray = new mongoose.Schema({
    _id:false,
    userName:String,
    message:String
})

const messageSchema = new mongoose.Schema({
    _id: {
        type:String,
        default:()=> uuidv4.v4().replace(/\-/g,'')
    },
    sendFrom: {
        type:String,
        require:true
    },
    sendTo:{
        type:String,
        require:true
    },
    messages:[messageArray],
    
    backGroundImage : String
},{
    collection: "Messages",
    timestamps: Date
})

const messages = mongoose.model('message',messageSchema);

module.exports = messages