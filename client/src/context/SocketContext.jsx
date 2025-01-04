import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext,useContext,useEffect,useRef } from "react";
import { io } from "socket.io-client";


const SocketContext=createContext(null);

export const useSocket=()=>{
     // console.log("useSocket at socketcontext");
     // console.log(SocketContext);
     return useContext(SocketContext);
};

export const SocketProvider=({children})=>{
     // console.log("contexts");. 
     const socket=useRef();
     const {userInfo}=useAppStore();
     
     useEffect(()=>{
          
          if(userInfo){
               socket.current=io(HOST,{
                    withCredentials:true,
                    query:{userId:userInfo.id},
               });
               socket.current.on("connect",()=>{
                    console.log("Connected to socket server");
               });
               // console.log("context2");
               const handleRecieveMessage=(message)=>{
                    // console.log("message rcv",message);
                    const {selectedChatData,selectedChatType,addMessage}=useAppStore.getState();
                    
                    if (selectedChatType!==undefined && (selectedChatData._id===message.sender._id || selectedChatData._id===message.recipient._id) ) {
                         console.log("message rcv",message);
                         addMessage(message);
                    }
               };

               const handleReceiveChannelMessage=(message)=>{
                    const {selectedChatData,selectedChatType,addMessage}=useAppStore.getState();

                    if (selectedChatType!==undefined && selectedChatData._id===message.channelId) {
                         addMessage(message);
                    }
               }

               socket.current.on("receiveMessage",handleRecieveMessage);
               socket.current.on("recieve-channel-message",handleReceiveChannelMessage);
               
               return ()=>{
                    socket.current.disconnect();
               };
          }
     },[userInfo]);

     return(
          <SocketContext.Provider value={socket.current}>
               {children}
          </SocketContext.Provider>
     )
}