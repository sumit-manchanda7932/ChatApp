


import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import Logo from "../../assets/Images/logo.ico";
import { Nav_Buttons, Profile_Menu } from "../../data/index.js";
import { Gear } from "phosphor-react";
import { faker } from "@faker-js/faker";
import AntSwitch from "../../components/AntSwitch.js";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import useSettings from "../../hooks/useSettings.js";
import { useNavigate } from "react-router-dom";
import { LogoutUser } from "../../redux/Slices/auth.js";
import { useDispatch, useSelector } from "react-redux";

const getPath=(index)=>{
  switch (index) {
    case 0:
      return "/app";
      case 1:
        return "/group";
        case 2:
        return "/call";
        
  }
}
const getMenuPath=(idx)=>{
  switch (idx) {
    case 0:
      return "/profile";
      case 1:
        return "/settings";
        case 2:
          // TODO=>Update token
        return "/auth/login";
        
  }
}

const SideBar = () => {
  const dispatch=useDispatch();
  const auth=useSelector((state)=>state.auth);
  const theme = useTheme();
  const { onToggleMode } = useSettings();
  const [selected, setSelected] = useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate=useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Box
      p={2}
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0,0,0.25)",
        height: "100vh",
        width: 100,
      }}
    >
      <Stack
        direction="column"
        spacing={3}
        sx={{ height: "100%" }}
        justifyContent="space-between"
        alignItems={"center"}
      >
        <Stack alignItems="center" spacing={4}>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              height: 64,
              width: 64,
              borderRadius: 1.5,
            }}
          >
            <img src={Logo} alt={"Chat app logo"} />
          </Box>
          <Stack
            direction="column"
            sx={{ width: "max-content" }}
            alignItems="center"
            spacing={3}
          >
            {Nav_Buttons.map((el) =>
              el.index === selected ? (
                <Box
                  p={1}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 1.5,
                  }}
                >
                  <IconButton
                    sx={{ width: "max-content", color: "#fff" }}
                    key={el.index}
                  >
                    {el.icon}
                  </IconButton>
                </Box>
              ) : (
                <IconButton
                  onClick={() => {
                    setSelected(el.index);
                    navigate(getPath(el.index));
                  }}
                  sx={{
                    width: "max-content",
                    color: theme.palette.mode === "light" ? "#000" : "#fff",
                  }}
                  key={el.index}
                >
                  {el.icon}
                </IconButton>
              )
            )}
            <Divider sx={{ width: "48px" }} />
            {selected === 3 ? (
              <Box
                p={1}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 1.5,
                }}
              >
                {" "}
                <IconButton sx={{ color: "#fff" }}>
                  <Gear />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                sx={{ color: theme.palette.mode === "light" ? "#000" : "#fff" }}
                onClick={() => {
                  setSelected(3);
                  navigate("/settings")
                }}
              >
                <Gear />
              </IconButton>
            )}
          </Stack>
        </Stack>
        <Stack spacing={4}>
          <AntSwitch
            onChange={() => {
              onToggleMode();
            }}
            defaultChecked
          />
          <Avatar
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            src={auth?.avatar}
          />
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
            anchorOrigin={{
              vertical:"bottom",
              horizontal:"right"
            }}
            
          >
            <Stack spacing={1} px={1}>
              {Profile_Menu.map((el,idx) => {
                return (
                  <MenuItem  onClick={()=>{
                    handleClick();
                    
                  }}>
                    <Stack
                    onClick={()=>{
                      navigate(getMenuPath(idx));
                      if(idx===2){
                        dispatch(LogoutUser());
                      }
                    }}
                      sx={{ width: 100 }}
                      direction={"row"}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <span>{el.title}</span>
                      {el.icon}
                    </Stack>
                  </MenuItem>
                );
              })}
            </Stack>
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SideBar;
