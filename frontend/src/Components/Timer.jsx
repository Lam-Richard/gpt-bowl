import React, {useEffect, useState} from 'react';

import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PauseIcon from '@mui/icons-material/Pause';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function Timer( {questions, time, isPaused, handleTimerChange} ) {
  const [progress, setProgress] =useState(100);
  

  useEffect(() => {
    let intervalId;
    console.log("isPaused: ", isPaused);
    if (!isPaused && questions.length > 0) {
      intervalId = setInterval(() => {
        if (time <= 0) {
            clearInterval(intervalId);
            return;
        }
        handleTimerChange((prevTime) => prevTime - 1);
        console.log(time)
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [questions, time, isPaused, handleTimerChange]);

  
  

  useEffect(() => {
    const newProgress = (time / 20) * 100; // calculate the new progress based on the remaining time
    setProgress(newProgress);
  }, [time]);

  const secondsLeft = Math.round((progress * 20) / 100);

  

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', marginY: '1rem' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ height: '15px', borderRadius: '10px', bgcolor: 'pink', '& .MuiLinearProgress-bar': {
      backgroundColor: 'rgba(0,0,255, 0.2)' }}}/>
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {secondsLeft}s
        </Typography>
      </Box>
    </Box>
  );
}