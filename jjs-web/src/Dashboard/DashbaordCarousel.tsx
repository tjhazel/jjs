import React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';

import Loader from '../Shared/Loader';
import { useAlbumList } from '../Data/AlbumFetcher';
import { File } from '../Model/Api/AlbumApi';
import { shuffleArray } from '../Album/AlbumContext';

const DashbaordCarousel: React.FunctionComponent = (props) => {
   
   const { data, isLoading, error } = useAlbumList();
   const [carouselImages, setCarouselImages] = React.useState<File[]>([]);  

   React.useEffect(() => {
      if (data && !isLoading) {
         const folderRoot = data.folders?.find(y => y.name.toLocaleLowerCase() === 'carousel');
         if (folderRoot && folderRoot?.files?.length > 0) {
            let shuffledImages = [...folderRoot.files];
            shuffleArray(shuffledImages);
            setCarouselImages(shuffledImages);
         }        
      }

   }, [data, isLoading]);

   const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

   const theme = useTheme();
   const [activeStep, setActiveStep] = React.useState(0);
   const maxSteps = carouselImages?.length;
 
   const handleNext = () => {
     setActiveStep((prevActiveStep) => prevActiveStep + 1);
   };
 
   const handleBack = () => {
     setActiveStep((prevActiveStep) => prevActiveStep - 1);
   };
 
   const handleStepChange = (step: number) => {
     setActiveStep(step);
   };

   if (!data && !isLoading) {
      return <Loader />
   }

   const html = (
      <Box sx={{ maxWidth: 400, flexGrow: 1 }} border={0}>
      <Paper
        square
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 50,
          pl: 2,
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h5" component="h3" gutterBottom>{carouselImages[activeStep]?.title ?? carouselImages[activeStep]?.name}</Typography>
      </Paper>
      <AutoPlaySwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={activeStep}
        onChangeIndex={handleStepChange}
        enableMouseEvents
      >
        {carouselImages.map((step, index) => (
          <div key={step.relativePath}>
            {Math.abs(activeStep - index) <= 2 ? (
              <Box
                component="img"
                sx={{
                  height: 300,
                  display: 'block',
                  maxWidth: 400,
                  overflow: 'hidden',
                  width: '100%',
                }}
                src={step.httpPath}
                alt={step.relativePath}
              />
            ) : null}
          </div>
        ))}
      </AutoPlaySwipeableViews>
      <Typography>{carouselImages[activeStep]?.comment}</Typography>
      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
          >
            Next
            {theme.direction === 'rtl' ? (
              <KeyboardArrowLeft />
            ) : (
              <KeyboardArrowRight />
            )}
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? (
              <KeyboardArrowRight />
            ) : (
              <KeyboardArrowLeft />
            )}
            Back
          </Button>
        }
      />
    </Box>         
   )

   return html;
}

export default DashbaordCarousel;
