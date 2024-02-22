const mongoose = require('mongoose');
const uuid = require('uuid');

const messages = new mongoose.Schema({
    _id : false,
    userName : String,
    message : String
});

const GroupMessage = new mongoose.Schema({
    _id : {
        type : String,
        default : () => uuid.v4().replace(/\-/g,'')
    },
    groupName : {
        type : String,
        require : true
    },
    membersIn : Array,
    membersMessages : [messages],
    gImage:String,
    GroupBackground:String
},{
    collection : 'GroupMessages',
    timestamps : Date
})

const group = mongoose.model('groupMessage' , GroupMessage);
module.exports = group