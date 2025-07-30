  import React, { useState, useEffect } from "react";
  import { Link as RouterLink } from "react-router-dom";
  import { GoogleAuthProvider, useGoogleAuth } from '../Auth/AuthProvider';
import { IconButton, IButtonStyles } from '@fluentui/react/lib/Button';
import { Link } from '@fluentui/react/lib/Link';
import { IOverflowSetItemProps, OverflowSet } from '@fluentui/react/lib/OverflowSet';

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
        <>
          {logoDisplay}
              <Pivot overflowBehavior="menu">
                  {getMenuButtons()}
              </Pivot>
          {/* <div style={{ maxHeight: '50px', maxWidth: '100%', backgroundImage:'./Images/header.jpg' }}></div> */}
        </>
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
        {/*<AppBar */}
        {/*//className={header}*/}
        {/*>*/}
        {/*  {mobileView ? displayMobile() : displayDesktop()}*/}
        {/*</AppBar>*/}
      </header>
    );
  }

  
export default Header;

//const noOp = () => undefined;

//const onRenderItem = (item: IOverflowSetItemProps): JSX.Element => {
//    return (
//        <Link role="menuitem" styles={{ root: { marginRight: 10 } }} onClick={item.onClick}>
//            {item.name}
//        </Link>
//    );
//};

//const onRenderOverflowButton = (overflowItems: any[] | undefined): JSX.Element => {
//    const buttonStyles: Partial<IButtonStyles> = {
//        root: {
//            minWidth: 0,
//            padding: '0 4px',
//            alignSelf: 'stretch',
//            height: 'auto',
//        },
//    };
//    return (
//        <IconButton
//            role="menuitem"
//            title="More options"
//            styles={buttonStyles}
//            menuIconProps={{ iconName: 'More' }}
//            menuProps={{ items: overflowItems! }}
//        />
//    );
//};


//const headersData = [
//    {
//        label: "Albums",
//        href: "/Album",
//    },
//    {
//        label: "Recipes",
//        href: "/Recipe",
//    },
//    {
//        label: "Links",
//        href: "/Link",
//    },
//    {
//        label: "My Account",
//        href: "/Admin",
//    }
//];

//const OverflowSetBasicExample: React.FunctionComponent = () => (
//    <OverflowSet
//        aria-label="Basic Menu Example"
//        role="menubar"
//        items={[
//            {
//                key: 'Albums',
//                name: 'Albums',
//                onClick: noOp,
//            },
//            {
//                key: 'Recipes',
//                name: 'Recipes',
//                onClick: noOp,
//            },
//            {
//                key: 'Things',
//                name: 'Things',
//                onClick: noOp,
//            },
//            {
//                key: 'My Account',
//                name: 'Admin',
//                onClick: noOp,
//            },
//        ]}
//        overflowItems={[
//            {
//                key: 'item4',
//                name: 'Overflow Link 1',
//                onClick: noOp,
//            },
//            {
//                key: 'item5',
//                name: 'Overflow Link 2',
//                onClick: noOp,
//            },
//        ]}
//        onRenderOverflowButton={onRenderOverflowButton}
//        onRenderItem={onRenderItem}
//    />
//);
