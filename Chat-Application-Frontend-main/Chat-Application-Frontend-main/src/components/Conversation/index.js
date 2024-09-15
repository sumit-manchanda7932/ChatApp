import {
  Box,
  Stack,
} from "@mui/material";
import React, { useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Message } from "./Message";
import { useSelector } from "react-redux";

const Conversation = () => {
  const {  current_messages } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const messageListRef = useRef(null);
  useEffect(() => {
    // Scroll to the bottom of the message list when new messages are added
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [current_messages]);

  return (
    <Stack height={"100%"} maxHeight={"100vh"} sx={{ width: "auto" }}>
      <Header />
      <Box
       ref={messageListRef}
        sx={{
          flexGrow: 1,
          width: "100%",
          overflowY: "auto",
          scrollbarwidth: "thin",
          "&::-webkit-scrollbar": {
            width: "0.4em",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundcolor: "#888",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
        }}
      >
        <Message menu={true} />
      </Box>
      <Footer />
    </Stack>
  );
};

export default Conversation;
