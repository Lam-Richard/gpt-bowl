import React, {useEffect, useState} from 'react';

import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PauseIcon from '@mui/icons-material/Pause';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function Timer( {questions, time, isPaused} ) {
  const [progress, setProgress] =useState(100);


  useEffect(() => {
    const newProgress = (time / 20) * 100; // calculate the new progress based on the remaining time
    setProgress(newProgress);
  }, [time]);

  const secondsLeft = Math.round((progress * 20) / 100);

  

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', marginY: '1rem' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ height: '15px', borderRadius: '10px', bgcolor: 'pink', '& .MuiLinearProgress-bar': {
      backgroundColor: 'purple' }}}/>
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {secondsLeft}s
        </Typography>
      </Box>
    </Box>
  );
}