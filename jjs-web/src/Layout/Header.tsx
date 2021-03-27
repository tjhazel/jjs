import {
    AppBar,
    Toolbar,
    Typography,
    makeStyles,
    Button,
    IconButton,
    Drawer,
    Link,
    MenuItem,
  } from "@material-ui/core";
  import MenuIcon from "@material-ui/icons/Menu";
  import React, { useState, useEffect } from "react";
  import { Link as RouterLink } from "react-router-dom";
  import { GoogleAuthProvider, useGoogleAuth } from '../Auth/AuthProvider';

  const headersData = [
    {
      label: "Albums",
        href: "/Albums",
    },
    {
      label: "Recipes",
       href: "/Recipes",
    },
    {
      label: "Links",
       href: "/Links",
    },
    {
      label: "My Account",
      href: "/Admin",
    }
  ];
  
  const useStyles = makeStyles(() => ({
    header: {
      backgroundColor: "#008080",
      paddingRight: "79px",
      paddingLeft: "118px",
      "@media (max-width: 900px)": {
        paddingLeft: 0,
      },
    },
    logo: {
      fontFamily: "Work Sans, sans-serif",
      fontWeight: 600,
      color: "#FFFEFE",
      textAlign: "left",
    },
    menuButton: {
      fontFamily: "Open Sans, sans-serif",
      fontWeight: 700,
      size: "18px",
      marginLeft: "38px",
    },
    toolbar: {
      display: "flex",
      justifyContent: "space-between",
    },
    drawerContainer: {
      padding: "20px 30px",
    },
  }));
  
  function Header() {
    const { signIn, signOut, googleUser, isSignedIn } = useGoogleAuth();
    const signInFunc = () => {
      
      console.log('begin sign in');
      signIn();
      console.log('end sign in');
    }


    const { header, logo, menuButton, toolbar, drawerContainer } = useStyles();
  
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
        <Toolbar className={toolbar}>
          {femmecubatorLogo}
          <div>{getMenuButtons()}</div>
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
            <div className={drawerContainer}>{getDrawerChoices()}</div>
          </Drawer>
  
          <div>{femmecubatorLogo}</div>
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
  
     const femmecubatorLogo = (
       <Link href="\">
         <Typography variant="h6" component="h1" className={logo}>
            John, Jeri, &amp; Sidney
         </Typography>
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
                className: menuButton,
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
              className: menuButton,
            }}
          >
            {isSignedIn&&href==='/Admin'?googleUser?.profileObj?.givenName : label}
          </Button>
        );
      });
    };
  
    return (
      <header>
        <AppBar className={header}>
          {mobileView ? displayMobile() : displayDesktop()}
        </AppBar>
      </header>
    );
  }

  
export default Header;