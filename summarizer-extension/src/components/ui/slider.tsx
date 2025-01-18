import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

function valuetext(value: number) {
  return `${value} words`;
}

export default function DiscreteSlider() {
  return (
    <Box sx={{ width: 200 }}>
     
      <Slider sx={{
          color: 'white', // Change the slider track color
          '& .MuiSlider-thumb': {
            backgroundColor: 'white', // Change the thumb color
          },
          '& .MuiSlider-rail': {
            backgroundColor: 'gray', // Change the rail color
          },
        }}
defaultValue={200} step={100} marks min={100} max={400}   getAriaValueText={valuetext}
/>
    </Box>
  );
}