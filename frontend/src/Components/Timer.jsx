import * as React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PauseIcon from '@mui/icons-material/Pause';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function Timer( {time, isPaused, handleTimerChange} ) {
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    let intervalId;
    if (!isPaused) {
      intervalId = setInterval(() => {
        if (time <= 0) {
            clearInterval(intervalId);
            return;
        }
        handleTimerChange((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [time, isPaused, handleTimerChange]);

  React.useEffect(() => {
    const newProgress = (time / 30) * 100; // calculate the new progress based on the remaining time
    setProgress(newProgress);
  }, [time]);

  const secondsLeft = Math.round((progress * 30) / 100);

  

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {secondsLeft}s
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton>
          <SkipNextIcon />
        </IconButton>
        <IconButton>
          <PauseIcon />
        </IconButton>
      </Box>
    </Box>
  );
}