import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function Heading() {
  return (
    <Typography variant="h1" component="h1" gutterBottom sx={{ fontFamily: 'Open Sans', fontWeight: 'bold', color: '#2c3e50', marginTop: "20px" }}>
      GPT Bowl
    </Typography>
  );
}