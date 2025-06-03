import React from 'react';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

function TrainingComponent({ onTrain, isTraining, progress, logs, disabled }) {
  return (
    <Paper elevation={2} className="container" sx={{ padding: 3 }}>
      <Typography variant="h2" component="h3" gutterBottom>
        3. Train Your Model
      </Typography>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={onTrain} 
        disabled={isTraining || disabled}
        fullWidth
        sx={{ marginBottom: 2, padding: '10px 0', fontSize: '1.1rem' }}
      >
        {isTraining ? 'Training...' : 'Train Model'}
      </Button>
      
      {isTraining && (
        <Box sx={{ width: '100%', marginTop: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', marginTop: 1}}>
            {`Progress: ${Math.round(progress)}%`}
          </Typography>
        </Box>
      )}

      {logs.length > 0 && (
        <Box sx={{ marginTop: 2, maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '4px', background: '#f9f9f9' }}>
          <Typography variant="subtitle2" gutterBottom>Training Logs:</Typography>
          {logs.map((log, index) => (
            <Typography key={index} variant="caption" display="block">
              {log}
            </Typography>
          ))}
        </Box>
      )}
      {!isTraining && progress === 100 && !disabled && (
        <Typography variant="body1" color="green" sx={{marginTop: 2}}>
            Training Complete! Check results below.
        </Typography>
      )}
    </Paper>
  );
}

export default TrainingComponent; 