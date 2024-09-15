


import { Box, Stack } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { Chat_History } from "../../data/index.js";
import {
  Mediamsg,
  ReplyMsg,
  TextMsg,
  Timeline,
  LinkMsg,
  DocMsg,
} from "./MsgTypes.js";
import { useDispatch, useSelector } from "react-redux";
import { FetchCurrentMessages, SetCurrentConversation } from "../../redux/Slices/conversation.js";
import { socket } from "../../socket.js";

export const Message = ({menu}) => {

    const dispatch = useDispatch();

    const { conversations, current_messages } = useSelector(
      (state) => state.conversation.direct_chat
    );

    const { room_id } = useSelector((state) => state.app);

    useEffect(() => {
      const current = conversations.find((el) => el?.id === room_id);

      socket.emit("get_messages", { conversation_id: current?.id }, (data) => {
        // data => list of messages
        console.log(data, "List of messages");
        dispatch(FetchCurrentMessages({ messages: data }));
        
      });

      dispatch(SetCurrentConversation(current));
    }, [room_id]);
  return (
    <Box  p={3}>
      <Stack spacing={3}>
        {current_messages?.map((el) => {
          switch (el.type) {
            case "divider":
              return <Timeline el={el} />;
            case "msg":
              switch (el.subtype) {
                case "Img":
                  return <Mediamsg el={el} menu={menu} />;
                case "Doc":
                  return <DocMsg el={el} menu={menu} />;
                case "Link":
                  return <LinkMsg el={el} menu={menu} />;
                case "Reply":
                  return <ReplyMsg el={el} menu={menu} />;
                default:
                  return <TextMsg el={el} menu={menu} />;
              }
             
            default:
             return <></>;
          }
        })}
      </Stack>
    </Box>
  );
};
