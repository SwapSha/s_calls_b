const socket = io('/');
const myPeer = new Peer(undefined,{
    host:'/',
    port:'3001'
})

const peers = {};

navigator.mediaDevices.getUserMedia({
    audio:true,
    video:true
}).then(stream => {

    addVideoStream(myVideo, stream);

    myPeer.on('call' , call => {
        call.answer(stream); 
        const video = document.createElement("video");
        call.on("stream" , (userVideoStream)=>{
            addVideoStream(video , userVideoStream);
        });
    });    
})

socket.on('video-connected' , (userId)=>{
  connectToNewUser(userId , stream);
});


socket.on('video-disconnected' , userId => {
console.log("User Disconnected");
if(peers[userId]) peers[userId].close();
})

myPeer.on("open",(id)=>{
socket.emit("video-chat" , ROOM_ID,id);
});

function addVideoStream (video, stream) {
video.srcObject = stream;
video.addEventListener("loadedmetadata", () => {
   video.play();
});
videoGrid.append(video);
};


function connectToNewUser (userId , stream) {   
const call = myPeer.call(userId,stream);
const video = document.createElement('video'); 
call.on('stream' , userVideoStream => {
    addVideoStream(video , userVideoStream);
})
call.on('error',(error)=>{
    console.log("Error inside connectToNewUser function : ",error);
})
call.on('close' , ()=>{
    video.remove();
});

peers[userId] = call
}
