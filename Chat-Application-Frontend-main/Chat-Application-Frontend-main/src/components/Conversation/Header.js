import React from "react";
import {
  Avatar,
  Box,
  Stack,
  Badge,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import StyledBadge from "../StyledBadge";
import { useTheme } from "@mui/material/styles";
import { faker } from "@faker-js/faker";
import { CaretDown, MagnifyingGlass, Phone, VideoCamera } from "phosphor-react";
import { ToggleSidebar } from "../../redux/Slices/app";
import { useDispatch, useSelector } from "react-redux";

const Header = () => {
  const dispatch=useDispatch();
  const {current_conversation}=useSelector((state)=>state.conversation.direct_chat);
  const theme = useTheme();
  return (
    <Box
      p={2}
      sx={{
        width: "100%",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
      }}
    >
      <Stack
        alignItems={"center"}
        direction={"row"}
        justifyContent={"space-between"}
        sx={{ width: "100%", height: "100%" }}
      >
        <Stack onClick={()=>{
          dispatch(ToggleSidebar());
        }}
        direction={"row"} spacing={2}
        >
          <Box>
            {current_conversation?.online==="Online"?
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar alt={current_conversation?.name} src={current_conversation?.img} />
            </StyledBadge>:<Avatar alt={current_conversation?.name} src={current_conversation?.img} />
}
          </Box>
          <Stack spacing={0.2}>
            <Typography variant="subtitle2">{current_conversation?.name}</Typography>
            <Typography variant="caption">{current_conversation?.online}</Typography>
          </Stack>
        </Stack>
        <Stack direction={"row"} alignItems={"center"} spacing={3}>
          <IconButton>
            <VideoCamera />
          </IconButton>
          <IconButton>
            <Phone />
          </IconButton>
          <IconButton>
            <MagnifyingGlass />
          </IconButton>
          <Divider orientation="vertical" flexItem />
          <IconButton>
            <CaretDown />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Header;
