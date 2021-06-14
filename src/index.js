const http=require('http');
const path=require("path");
const socketio=require('socket.io');
const {generateMessage,generateLocationMessage}=require('./utils/messages');
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users');

const express=require('express');
const app=express();
const server=http.createServer(app);
const io=socketio(server);


let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}
const publicDirecotryPath=path.join(__dirname,'../public');
app.use(express.static(publicDirecotryPath));
//let count=0;
io.on('connection',(socket)=>{



  socket.on("join",({username,room},callback)=>{
    const {error,user}=addUser({id:socket.id,username,room});
    if(error){
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message",generateMessage("Admin","Welcome"));
    socket.broadcast.to(user.room).emit("message",generateMessage("Admin",`${user.username} is joined!`));
    io.to(user.room).emit("roomData",{
      room:user.room,
      users:getUsersInRoom(user.room)
    })
    callback();
  })

  socket.on("sendMessage",(message,callback)=>{
    const user=getUser(socket.id);
    io.to(user.room).emit("message",generateMessage(user.username,message));
    callback("delivered")
  });
  socket.on("sendlocation",(coords)=>{
    const user=getUser(socket.id);
    io.to(user.room).emit("locationMessage",generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
  })
  socket.on('disconnect',()=>{
    const user=removeUser(socket.id);
    if(user){
      io.to(user.room).emit("message",generateMessage("Admin",`${user.username} has left!`));
      io.to(user.room).emit("roomData",{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    }

  })
  // socket.emit('countUpdated',count);
  // //socket.emit('increment',count);
  // socket.on('increment',()=>{
  //   count++;
  //   //socket.emit("countUpdated",count);
  //   io.emit("countUpdated",count)
  // });
})
server.listen(port,()=>{
  console.log("Port is listening to the 4000");
});
