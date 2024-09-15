

import { Stack } from "@mui/material";
import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, socket } from "../../socket";
import { SelectConversation, showSnackbar } from "../../redux/Slices/app";
import { AddDirectConversation, AddDirectMessage, ChangeConversationStatus, UpdateDirectConversation } from "../../redux/Slices/conversation";
import useIsVisible from "../../hooks/useIsVisible";

const DashboardLayout = () => {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { conversations, current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const user_id = window.localStorage.getItem("user_id");
    const isVisible=useIsVisible();
  useEffect(() => {
    if (isLoggedIn) {
      window.onload = function () {
        if (!window.location.hash) {
          window.location = window.location + "#loaded";
          window.location.reload();
        }
      };
      window.onload();

      if (!socket) {
        connectSocket(user_id);
        console.log("socket connected");
      }

      socket.on("new_friend_request", (data) => {
        dispatch(showSnackbar({ severity: "success", message: data.message }));
      });
      socket.on("request_accepted", (data) => {
        dispatch(showSnackbar({ severity: "success", message: data.message }));
      });
      socket.on("request_sent", (data) => {
        dispatch(showSnackbar({ severity: "success", message: data.message }));
      });
      socket.on("start_chat",(data)=>{
          console.log(data);
          const existing_conversation=conversations.find((el)=>el.id===data._id);
          if(existing_conversation){
            dispatch(UpdateDirectConversation({conversation:data}));
          }else{
            // add direct conversation 
            dispatch(AddDirectConversation({conversation:data}));
          }
          dispatch(SelectConversation({room_id:data._id}));
      })
      socket.on("new_message", (data) => {
        const message = data.message;
        console.log(current_conversation, data);
        // check if msg we got is from currently selected conversation
        if (current_conversation?.id === data.conversation_id) {
          dispatch( 
            AddDirectMessage({
              id: message._id,
              type: "msg",
              subtype: message.type,
              message: message.text,
              incoming: message.to === user_id,
              outgoing: message.from === user_id,
              time:message.created_at,
            })
          );
        }
      });
      socket.on("change_status",(data)=>{
        if(data.id===current_conversation?.user_id){
          dispatch(ChangeConversationStatus(data));
          console.log(data.status);
        }
      })

      return () => {
        socket?.off("new_friend_request");
        socket?.off("request_accepted");
        socket?.off("request_sent");
        socket?.off("start_chat");
        socket?.off("new_message");
        socket?.off("change_status");
      };
    }
  },[isLoggedIn,socket,current_conversation]);

  useEffect(()=>{

    console.log("emitted");
    socket.emit("set_status",{user_id,isVisible});
    
  },[isVisible])

 
  if (!isLoggedIn) {
    return <Navigate to={"/auth/login"} />;

  }

  return (
    <Stack direction="row">
      <SideBar />
      <Outlet />
    </Stack>
  );
};

export default DashboardLayout;
