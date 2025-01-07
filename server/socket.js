import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModels.js";
import Channel from "./models/ChannelModel.js";
const setupSocket=(server)=>{
     const io=new SocketIOServer(server,{
          cors:{
               origin:process.env.ORIGIN,
               methods:["GET","POST"],
               credentials:true,

          },
     });
     const userSocketMap=new Map();
     
     const disconnect=(socket)=>{
          console.log(`Client Disconnected: ${socket.id} `);
          for(const [userId,socketId] of userSocketMap.entries()){
               if(socketId==socket.id){
                    userSocketMap.delete(userId);
                    break;
               }
          }
     };

     const sendMessage=async (message)=>{
          // console.log("sendMessage socket.js");
          const senderSocketId=userSocketMap.get(message.sender);
          const recipientSocketId=userSocketMap.get(message.recipient);
          // console.log("message into DB");
          console.log(message);
          const createdMessage=await Message.create(message);
          console.log("Created Message:", createdMessage);
          const messageData=await Message.findById(createdMessage._id).populate("sender","id email firstName lastName image color").populate("recipient","id email firstName lastName image color");
          // console.log("sendMessage setupSocket socket.js");
          // console.log(messageData);

          if (recipientSocketId) {
               io.to(recipientSocketId).emit("receiveMessage",messageData);
          }
          if (senderSocketId) {
               io.to(senderSocketId).emit("receiveMessage",messageData); 
          }
     };   

     const sendChannelMessage=async (message) => {
          const {channelId,sender,content,messageType,fileUrl}=message;
          const createdMessage=await Message.create({
               sender,
               recipient:null,
               content,
               messageType,
               timestamp:new Date(),
               fileUrl,
          });
          
          const messageData=await Message.findById(createdMessage._id).populate("sender","id email firstName lastName image color").exec();
          await Channel.findByIdAndUpdate(channelId,{
               $push:{messages:createdMessage._id},
          });
          const channel=await Channel.findById(channelId).populate("members");
          if (!channel) {
               console.error(`Channel not found for ID: ${channelId}`);
               return;
             }
          const finalData={...messageData._doc,channelId: channel._id};
          if (channel && channel.members) {
               channel.members.forEach((member)=>{
                    const memberSocketId=userSocketMap.get(member._id.toString());
                    if (memberSocketId) {
                         io.to(memberSocketId).emit("recieve-channel-message",finalData);
                    }
               
               });
               const adminSocketId=userSocketMap.get(channel.admin._id.toString());
               if (adminSocketId) {
                    io.to(adminSocketId).emit("recieve-channel-message",finalData);
               }
          }
     };

     io.on("connection",(socket)=>{
          const userId=socket.handshake.query.userId;

          if (userId) {
               userSocketMap.set(userId,socket.id);
               console.log(`User connected: ${userId} with socket ID: ${socket.id} `);
               
          }
          else{
               console.log("User ID not provided during connection.");
          }

          // console.log("io on");
          
          socket.on("sendMessage",sendMessage);
          socket.on("send-channel-message",sendChannelMessage);
          socket.on("disconnect",()=>disconnect(socket));

     });
};

export default setupSocket;