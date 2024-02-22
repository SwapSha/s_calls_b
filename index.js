const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const bodyparser = require('body-parser');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const user = require('./users.js');
const message = require('./message.js');
const groupmessage = require('./groupMessage.js');

const mongoose = require('mongoose');
const URL = "mongodb+srv://swapnilsharma:SWAPnil%401234@cluster0.c67cakc.mongodb.net/ChattingDB"

mongoose.connect(URL);

// const client = new MongoClient('mongodb://127.0.0.1:27017')
// const passport = require('passport');
// const passportJWT = require('passport-jwt');
// const jwtStrategy = passportJWT.Strategy;
// const extractJwt = passportJWT.ExtractJwt;

const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 3000;
const jwtSecretKey = secretKey(6);
const md = require('md5');

app.use(cors());
app.use(bodyparser.json());

app.post("/login" , (req,res) => {
	let hashPassword = md(req.body.passWord);
	const users = {
		userName : req.body.userName,
		passWord : hashPassword
	};
	user.findOne(({userName : users.userName , passWord : users.passWord})).then(async (item)=>{
		if(item != null){
			const token = jwt.sign( {data:users} , jwtSecretKey , {expiresIn:"1h"} );
			res.json({ token });
		}else{
			res.status(401).end();
		}
	})
});

app.post("/join" , (res,req)=>{
	let hashPassword = md(res.body.passWord);
		UserDetail = {firstName:res.body.firstName , lastName:res.body.lastName , userName:res.body.userName , passWord: hashPassword , profile : `${res.body.profilePicture}`}
		user.create(UserDetail).then((response)=>{
			console.log(response);
		}).catch((err)=> console.log(err));
})

let profilestorage = multer.diskStorage({
	destination: (req,res,cb)=>{
		cb(null , 'D:/ChattingApp/backend/profile')
	},
	filename: (req,file,cb)=>{
		cb(null , file.originalname)
	}
});

let upload = multer({ storage:profilestorage });

app.post('/upload',upload.single('profilePic') ,(req, res) => {
	if(req.file){
	}
	res.json({ message: 'File uploaded successfully!' });
});
// ////////////

let backgroundstorage = multer.diskStorage({
	destination: (req,res,cb)=>{
		cb(null , 'D:/ChattingApp/backend/personalBackground')
	},
	filename: (req,file,cb)=>{
		cb(null , file.originalname)
	}
});

let uploadbg = multer({ storage:backgroundstorage});

app.post('/backgroundImg/:sendTo' , uploadbg.single('backgroundimg') , (req,res)=>{
	
	if(req.file){
		console.log(req.file);
		console.log("Params :",req.params);
		
		message.findByIdAndUpdate({_id : req.params.sendTo} , 
			{ $set : {
				backGroundImage : req.file.originalname
			}}).then((res)=>{
				console.log("After insert of the image in msgs : ",res);
			})
	}
	res.json({ message: 'File uploaded successfully!' });
})

// ////////////////////
let groupBackStorage = multer.diskStorage({
	destination: (req,res,cb)=>{
		cb(null , 'D:/ChattingApp/backend/groupBackground')
	},
	filename: (req,file,cb)=>{
		cb(null , file.originalname)
	}
});

let uploadgroupback = multer({ storage:groupBackStorage});

app.post('/groupbackimage/:Gid' , uploadgroupback.single('groupBackimage') , (req,res)=>{
	if(req.file){
		// console.log(req.file);
		// console.log("Params :",req.params);
		
		groupmessage.findByIdAndUpdate({_id : req.params.Gid} , 
			{ $set : {
				GroupBackground : req.file.originalname
			}}).then((res)=>{
				console.log("After insert of the image in msgs : ",res);
			})
	}
	res.json({ message: 'File uploaded successfully!' });
})

/////////////////
// ////////////////////

let groupstorage = multer.diskStorage({
	destination: (req,res,cb)=>{
		cb(null , 'D:/ChattingApp/backend/groupProfile')
	},
	filename: (req,file,cb)=>{
		cb(null , file.originalname)
	}
});

let uploadgroup = multer({ storage:groupstorage});


app.post('/groupimage' , uploadgroup.single('groupimage') , (req,res)=>{
	if(req.file){
		console.log(req.file);
	}
	res.json({ message: 'File uploaded successfully!' });
})

// ////////////////
app.get('/getprofileimage/:imagename',(req,res)=>{
	res.sendFile("D:/ChattingApp/backend/profile/"+req.params.imagename);
});

app.get('/getpersonalbackgroundimage/:imagename',(req,res)=>{
	console.log(req.params);
	res.sendFile("D:/ChattingApp/backend/personalBackground/"+req.params.imagename);
})
app.get('/getgroupbackgroundimage/:imagename',(req,res)=>{
	console.log(req.params);
	res.sendFile("D:/ChattingApp/backend/groupBackground/"+req.params.imagename);
})
app.get('/getgroupbackgroundimage/:imagename',(req,res)=>{
	console.log(req.params);
	res.sendFile("D:/ChattingApp/backend/background/"+req.params.imagename);
})

app.get('/getgroupimage/:imagename',(req,res)=>{
	res.sendFile("D:/ChattingApp/backend/groupProfile/"+req.params.imagename);
})

// Drag and Drop multer
let dragDropstorage = multer.diskStorage({
	destination: (req,res,cb)=>{
		cb(null , 'D:/ChattingApp/backend/multipleFiles')
	},
	filename: (req,file,cb)=>{
		cb(null , file.originalname)
	}
});

let uploaddragDrop = multer({ storage:dragDropstorage , limits: { fileSize: 25 * 1024 * 1024 }}); 

app.post('/dragDrop' , uploaddragDrop.array('fileUpload',10) , (req,res)=>{
	if(req.file){
		console.log(req.file);
		console.log("Params :",req.params);
		
		// groupmessage.findByIdAndUpdate({_id : req.params.Gid} , 
		// 	{ $set : {
		// 		gImage : req.file.originalname
		// 	}}).then((res)=>{
		// 		console.log("After insert of the image in msgs : ",res);
		// 	})
		res.json({ message: 'Drag & Drop File uploaded successfully!' });
	}
})

 onlineUsers = [];
io.on('connection', (socket) => {
	let activeroomID = socket.activeRoom;
	console.log('User connected ',socket.id);

	socket.on("new-user-add", (newUserId) => {
		if (!onlineUsers.some((user) => user.userId === newUserId)) {  
		  onlineUsers.push({ userId: newUserId, socketId: socket.id });
		}
		io.emit("get-users", onlineUsers);
	  });

	socket.on("newUser", async (data)=> {
		let hashPassword = md(data.passWord);
		UserDetail = {firstName:data.firstName , lastName:data.lastName , userName:data.userName , passWord: hashPassword , profile : `${data.profilePicture}`}
		await user.create(UserDetail).then((response)=>{
			console.log(response);
		}).catch((err)=> console.log(err));
	});

	socket.on("oldMessages" , async (data)=>{
	await message.findOne({$or:[{sendFrom : data.loggedIN , sendTo: data.selectUSER} , {sendFrom : data.selectUSER , sendTo: data.loggedIN}]}).then((res)=>{
		if(res == null){
			res = []
		}
		socket.join(res._id);
		socket.activeRoom = res._id;
		// console.log("Group Active Room : ",socket.activeRoom);
		socket.emit("oldMessages" , res);
		})
	});

	socket.on("getUsers", async ()=>{
		user.find().then((data)=>{
			socket.emit("getUsers" , data);
		})
	});

	socket.on('message', async (data) => {
		let msg = {
			sendTo: data.sendTo,
			sendFrom : data.sendFrom,
			messages : { 
				userName : data.messages.userName,
				message : data.messages.message
			}
		}
		let filterUserMsg;
		filterUserMsg = await message.findOne({$or:[{sendFrom : msg.sendFrom , sendTo: msg.sendTo} , {sendFrom : msg.sendTo , sendTo: msg.sendFrom}]}).then((res)=>{
			return res
		})
		if(filterUserMsg){
			// console.log("Send To and Send From ARE Exist in DB !!!");
			await message.updateOne({"_id" : filterUserMsg._id} , {
					$push: {
						"messages" : [
							{ 
							"userName" : msg.messages.userName,
							"message" : msg.messages.message
							}
									 ]
						}
					}).then(()=>{
						// console.log("Message pushed perfectly");
					})
		}else{
			message.create(msg).then(()=>{
					// console.log("New Message group inserted");
			});
		}

		this.latestChat = await message.findOne({$or:[{sendFrom : msg.sendFrom , sendTo: msg.sendTo} , {sendFrom : msg.sendTo , sendTo: msg.sendFrom}]}).then((res)=>{
			return res
		})
	    // io.emit('message', latestChat); // Broadcast the message to all connected clients
		io.to(socket.activeRoom).emit('message' , this.latestChat); // Broadcast the message to all connected clients
	});

	socket.on('createGroup', async(data)=>{
		let msgsenddata = {
			groupName : data.groupName,
			membersIn : data.membersIn,
			gImage : data.gImage
		}
		let response = await groupmessage.findOne({groupName:data.groupName}).then(async(res)=>{
			console.log(res);
			if(res == null){
				await groupmessage.create(msgsenddata).then((res)=>{
					console.log(res);
				});
				return true
			}else{
				return false
			}
		})
		io.emit("createGroup",response)
	});

	socket.on('getAllGroupChat' , async(data)=>{
		await groupmessage.find({ membersIn : {'$in' : [data]} }).then((groups)=>{
			socket.emit('getAllGroupChat' , groups);
		})
	})

	socket.on('groupChat', async(data)=>{
		await groupmessage.findOne(({membersIn : {'$in' : [data.uName] }},{ groupName : {'$in' : [data.gName]} })).then((response)=>{
			socket.join(response._id);
			socket.activeRoom = response._id;
			socket.emit('groupChat' , response);
		});
	});

	socket.on('chatRoomConnect' , async(gData)=>{
		// console.log("Group Message Data : ",gData," Current room : ",socket.adapter.rooms);
		await groupmessage.findOne(({membersIn : {'$in' : [gData.uName] }},{ groupName : {'$in' : [gData.gName]} })).then(async (response)=>{

			await groupmessage.updateOne({"_id" : response._id},{
				$push : {
					'membersMessages' : [{
						'userName' : gData.uName,
						'message' : gData.uMessage
					}]
				}
			});
			await groupmessage.findOne(({membersIn : {'$in' : [gData.uName] }},{ groupName : {'$in' : [gData.gName]} })).then((response)=>{
				// console.log("Data of the Group : ",response);
				io.to(response._id).emit("chatRoomConnect" , response);
			});
		});

	});

	socket.on('video-chat' ,( roomID , userId )=>{
		// console.log("ROOMID : ",roomID," && USERID : ",userId);
		socket.join(roomID);
		socket.broadcast.emit('video-connected', userId);

		socket.on('disconnect' , ()=>{
			socket.broadcast.emit('video-disconnected', userId)
		});
	})

	socket.on('disconnect', () => {
	  socket.leave(activeroomID);
	  onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id)
	  io.emit("get-users", onlineUsers);
	  console.log('User disconnected');
	});
});

mongoose.connection.on("connected" , () => {
    console.log("Mongo has connected Succesfully");
})

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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});