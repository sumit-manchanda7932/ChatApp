

import React, { useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import { MagnifyingGlass, Plus } from "phosphor-react";
import ChatElement from "../../components/ChatElement";
import { CallList, ChatList } from "../../data";
import CreateGroup from "../../sections/main/CreateGroup";
import { CallLogElement } from "../../components/CallElement";
import StartCall from "../../sections/main/StartCall";

const Call = () => {
    const theme = useTheme();
  const [openDialog, setopenDialog] = useState(false);

  const handleCloseDialog = () => {
    setopenDialog(false);
  };
  return (
    <>
    <Stack direction={"row"} sx={{ width: "100%" }}>
    {/* Left */}
    <Box
      sx={{
        height: "100vh",
        width: 320,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background,
        boxShadow: "0 0 2px rgba(0,0,0.25)",
      }}
    >
      <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
        <Stack>
          <Typography variant="h5">Call Logs</Typography>
        </Stack>
        <Stack sx={{ width: "100%" }}>
          <Search>
            <SearchIconWrapper>
              <MagnifyingGlass color="#709CE6" />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Search..." />
          </Search>
        </Stack>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Typography variant="subtitle2" component={Link}>
            Start Conversation
          </Typography>
          <IconButton
            onClick={() => {
              setopenDialog(true);
            }}
          >
            <Plus style={{ color: theme.palette.primary.main }} />
          </IconButton>
        </Stack>
        <Divider />
        <Stack
          spacing={3}
          sx={{ flexGrow: 1, overflowY: "auto", height: "100%" }}
        >
          <Stack spacing={2.5}>
            
          {/* Call Logs */}
          {CallList.map((el)=><CallLogElement {...el}/>)}
          </Stack>
        </Stack>
      </Stack>
    </Box>

    {/* Right */}
    {/* //TODO =>Reuse conversational component */}
  </Stack>
  <StartCall open={openDialog} handleClose={handleCloseDialog}/>
  </>
  )
}

export default Call

