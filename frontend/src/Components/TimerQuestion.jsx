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
    console.log('buzzTimer progress: ', time / 7.0)
    let progressValue = (time / 7.0) * 100
    console.log('progressValue', progressValue)
    setProgress(progressValue)
  }, [time, isPaused]);

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
          {time}s
        </Typography>
      </Box>
    </Box>
  );
}