import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

interface IProps {
}

const MainFeature: React.FC<IProps> = (props) => {

   const html = (
      <Paper
      sx={{
        position: 'relative',
        backgroundColor: 'grey.800',
        color: '#fff',
        mb: 4,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url(./Images/header.jpg)`,
      }}
    >
     {/* Increase the priority of the hero background image */}
     {<img style={{ display: 'none' }} src='./Images/header.jpg' alt='John, Jeri, and Sidney' />}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,.3)',
        }}
      />
      <Grid container>
        <Grid item md={6}>
          <Box
            sx={{
              position: 'relative',
              p: { xs: 3, md: 6 },
              pr: { md: 0 },
            }}
          >
            <Typography component="h1" variant="h3" color="inherit" gutterBottom>
            John, Jeri, and Sidney
            </Typography>
            <Typography variant="h5" color="inherit" paragraph>
            Chronicles of some of our adventures, recipes, and stuffies. 
            </Typography>
            {/*
            <Link variant="subtitle1" href="#">
              {post.linkText}
            </Link>
            */}
          </Box>
        </Grid>
      </Grid>
    </Paper>
   )

   return html;
}

export default MainFeature;
