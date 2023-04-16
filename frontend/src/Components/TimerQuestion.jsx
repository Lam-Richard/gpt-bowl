import * as React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PauseIcon from '@mui/icons-material/Pause';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function TimerQuestion( {questions, time, isPaused, setIsPaused} ) {
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    let intervalId;
    if (isPaused) {
      intervalId = setInterval(() => {
        setProgress((prevProgress) =>
          prevProgress > 0 ? prevProgress - 1 : prevProgress
        );
      }, time * 10);
    }
    return () => clearInterval(intervalId);
  }, [time, isPaused]);

  const secondsLeft = Math.round((progress * time) / 100);

  React.useEffect(() => {
    if (progress === 0) {
      setIsPaused(prevPaused => !prevPaused);
    }
  }, [progress, setIsPaused]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', marginY: '1rem' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ height: '15px', borderRadius: '10px', bgcolor: 'pink', '& .MuiLinearProgress-bar': {
      backgroundColor: 'green' }}}/>
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {secondsLeft}s
        </Typography>
      </Box>
    </Box>
  );
}