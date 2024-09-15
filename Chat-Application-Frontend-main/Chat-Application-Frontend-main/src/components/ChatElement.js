import {
    Box,
    Typography,
    Stack,
    Avatar,
  } from "@mui/material";
  import React from "react";
  import { useTheme } from "@mui/material/styles";
  import StyledBadge from "./StyledBadge";
  import Badge from "@mui/material/Badge";
import { useDispatch } from "react-redux";
import { SelectConversation } from "../redux/Slices/app";
  
  

const ChatElement = ({ id, name, img, msg, time, unread, online }) => {
    const theme=useTheme();
    const dispatch=useDispatch();
  return (
    <Box 
    onClick={()=>{
      dispatch(SelectConversation({room_id:id}));
     
    }}
      sx={{
        "&:hover":{cursor:"pointer"},
        width: "100%",
        borderRadius: 1,
        backgroundColor: theme.palette.mode==="light"?"#fff":theme.palette.background.default,
      }}
      p={2}
    >
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Stack direction={"row"} spacing={2}>
          {online==="Online" ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar src={img} />
            </StyledBadge>
          ) : (
            <Avatar src={img} />
          )}
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{name}</Typography>
            <Typography variant="caption">{msg}</Typography>
          </Stack>
        </Stack>
        <Stack spacing={2} alignItems={"center"}>
          <Typography sx={{ fontWeight: 600 }} variant="caption">
            {time}
          </Typography>
          <Badge color="primary" badgeContent={unread}></Badge>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChatElement;