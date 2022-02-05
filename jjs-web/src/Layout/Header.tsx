import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Drawer,
    Link,
    MenuItem,
    Paper, Box, Grid
  } from "@mui/material";

  import MenuIcon from '@mui/icons-material/Menu';

  import React, { useState, useEffect } from "react";
  import { Link as RouterLink } from "react-router-dom";
  import { GoogleAuthProvider, useGoogleAuth } from '../Auth/AuthProvider';

  const headersData = [
    {
      label: "Albums",
        href: "/Album",
    },
    {
      label: "Recipes",
       href: "/Recipe",
    },
    {
      label: "Links",
       href: "/Link",
    },
    {
      label: "My Account",
      href: "/Admin",
    }
  ];

  
  function Header() {

    const { signIn, signOut, googleUser, isSignedIn } = useGoogleAuth();
    const signInFunc = () => {
      
      console.log('begin sign in');
      signIn();
      console.log('end sign in');
    }

    const [state, setState] = useState({
      mobileView: false,
      drawerOpen: false,
    });
  
    const { mobileView, drawerOpen } = state;
  
    useEffect(() => {
      const setResponsiveness = () => {
        return window.innerWidth < 900
          ? setState((prevState) => ({ ...prevState, mobileView: true }))
          : setState((prevState) => ({ ...prevState, mobileView: false }));
      };
  
      setResponsiveness();
  
      window.addEventListener("resize", () => setResponsiveness());
    }, []);
  
    const displayDesktop = () => {
      return (
        <Toolbar>
          {logoDisplay}
          <div>{getMenuButtons()}</div>
          {/* <div style={{ maxHeight: '50px', maxWidth: '100%', backgroundImage:'./Images/header.jpg' }}></div> */}
        </Toolbar>
      );
    };
  
    const displayMobile = () => {
      const handleDrawerOpen = () =>
        setState((prevState) => ({ ...prevState, drawerOpen: true }));
      const handleDrawerClose = () =>
        setState((prevState) => ({ ...prevState, drawerOpen: false }));
  
      return (
        <Toolbar>
          <IconButton
            {...{
              edge: "start",
              color: "inherit",
              "aria-label": "menu",
              "aria-haspopup": "true",
              onClick: handleDrawerOpen,
            }}
          >
            <MenuIcon />
          </IconButton>
  
          <Drawer
            {...{
              anchor: "left",
              open: drawerOpen,
              onClose: handleDrawerClose,
            }}
          >
            <div 
            //className={drawerContainer}
            >{getDrawerChoices()}</div>
          </Drawer>
  
          <div>{logoDisplay}</div>
        </Toolbar>
      );
    };
  
    const getDrawerChoices = () => {

      return headersData.map(({ label, href }) => {
        if (isSignedIn && href==='/Admin') {
          return(
            <Link
            {...{
              to: href,
              onClick: signInFunc,
              color: "inherit",
              style: { textDecoration: "none" },
              key: label,
            }}
          >
            <MenuItem>{googleUser?.googleId}</MenuItem>
          </Link>
          )}

        return (
          <Link
            {...{
              component: RouterLink,
              to: href,
              color: "inherit",
              style: { textDecoration: "none" },
              key: label,
            }}
          >
            <MenuItem>{label}</MenuItem>
          </Link>
        );
      });
    };
  
     const logoDisplay = (
       <Link href="\">
         <img style={{ maxHeight: '50px' }} src='./Images/logo.png' alt='John, Jeri, and Sidney' />
      </Link>
    );
  
    const getMenuButtons = () => {
      return headersData.map(({ label, href }) => {
        if (!isSignedIn && href==='/Admin') {
          return(
            <Button
              {...{
                key: label,
                color: "inherit",
                to: href,
                onClick: signInFunc,
              }}
            >
            {label}
          </Button>
          )}

        return (
          <Button
            {...{
              key: label,
              color: "inherit",
              to: href,
              component: RouterLink,
            //  className: menuButton,
            }}
          >
            {isSignedIn&&href==='/Admin'?googleUser?.profileObj?.givenName : label}
          </Button>
        );
      });
    };
  
    return (
      <header>
        <AppBar 
        //className={header}
        >
          {mobileView ? displayMobile() : displayDesktop()}
        </AppBar>
      </header>
    );
  }

  
export default Header;