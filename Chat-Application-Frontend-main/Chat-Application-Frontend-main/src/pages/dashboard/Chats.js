import {
  Box,
  IconButton,
  Typography,
  Stack,
  Button,
  Divider,
} from "@mui/material";
import { ArchiveBox, CircleDashed, MagnifyingGlass, User, Users } from "phosphor-react";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { ChatList } from "../../data";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import ChatElement from "../../components/ChatElement";
import Friends from "../../sections/main/Friends";
import { socket } from "../../socket";
import { useDispatch, useSelector } from "react-redux";
import { FetchDirectConversations } from "../../redux/Slices/conversation";

const user_id=window.localStorage.getItem("user_id");

const Chats = () => {
  const theme = useTheme();
  const {conversations}=useSelector((state)=>state.conversation.direct_chat);
  const [openDialog,setopenDialog]=useState(false);
  const dispatch=useDispatch();
  const handleCloseDialog=()=>{
    setopenDialog(false);
  }
  const handleOpenDialog=()=>{
    setopenDialog(true);
  }
  useEffect(()=>{
    socket.emit("get_direct_conversations",{user_id},(data)=>{
      // data =>list of Conversations
      dispatch(FetchDirectConversations({ conversations: data }));
      

    })
  },[])
  return (
    <>
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: 320,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0,0,0.25)",
      }}
    >
      <Stack p={3} spacing={2} sx={{ height: "100vh" }}>
        <Stack
          direction="row"
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Typography variant="h5">Chats</Typography>
          <Stack direction={"row"} alignItems={"center"} spacing={1}>
          <IconButton onClick={()=>{
            setopenDialog((open)=>!open);
          }}>
            <Users />
          </IconButton>
          <IconButton>
            <CircleDashed />
          </IconButton>
          </Stack>
        </Stack>
        <Stack>
          <Search>
            <SearchIconWrapper>
              <MagnifyingGlass color="#709CE6" />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Search..." />
          </Search>
        </Stack>
        <Stack spacing={1}>
          <Stack direction={"row"} alignItems={"center"} spacing={1.5}>
            <ArchiveBox size={24} />
            <Button>Archive</Button>
          </Stack>
          <Divider />
        </Stack>
        <Stack
          direction={"column"}
          spacing={2}
          sx={{
            flexGrow: 1,
            overflow: "auto",
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
            height: "100%",
          }}
        >
          <Stack spacing={2.4}>
            <Typography variant="subtitle2" sx={{ color: "#676767" }}>
              Pinned
            </Typography>
            {conversations.filter((el) => el.pinned).map((el) => {
              return <ChatElement {...el} />;
            })}
          </Stack>
          <Stack spacing={2.4} >
            <Typography variant="subtitle2" sx={{ color: "#676767" }}>
              All Chats
            </Typography>
            {conversations.filter((el) => !el.pinned).map((el) => {
              return <ChatElement {...el} />;
            })}
          </Stack>
        </Stack>
      </Stack>
    </Box>
    {openDialog && <Friends open={openDialog} handleClose={handleCloseDialog}/>}
    </>
  );
};
export default Chats;
