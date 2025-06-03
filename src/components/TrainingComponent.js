import React, { useState } from 'react';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';

function TrainingComponent({ onTrain, isTraining, progress, logs, disabled }) {
  const [openWhatIsTrainingModal, setOpenWhatIsTrainingModal] = useState(false);

  const handleOpenWhatIsTrainingModal = (event) => {
    event.preventDefault();
    setOpenWhatIsTrainingModal(true);
  };

  const handleCloseWhatIsTrainingModal = () => {
    setOpenWhatIsTrainingModal(false);
  };

  let trainingProgressText = `Progress: ${Math.round(progress)}%`;
  if (isTraining) {
    if (progress < 20) {
      trainingProgressText = "Preparing data...";
    } else if (progress < 70) {
      trainingProgressText = "Learning from features & analyzing patterns...";
    } else {
      trainingProgressText = "Finalizing model...";
    }
  }

  return (
    <Paper elevation={2} className="container" sx={{ padding: 3, maxWidth: '80%', marginX: 'auto' }}> {/* MODIFIED: Added maxWidth and marginX */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1 }}>
        <Typography variant="h2" component="h3">
          3. Train Your Model
        </Typography>
        <Link href="#" onClick={handleOpenWhatIsTrainingModal} variant="body2" sx={{ alignSelf: 'center'}}>
          What's this?
        </Link>
      </Box>
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
            {trainingProgressText}
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

      <Dialog
        open={openWhatIsTrainingModal}
        onClose={handleCloseWhatIsTrainingModal}
        aria-labelledby="what-is-training-dialog-title"
      >
        <DialogTitle id="what-is-training-dialog-title">{"What is Training a Model?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Imagine teaching a child to recognize apples. You show them many examples (your data), pointing out features like color and shape. 
            'Training' is like the model learning the patterns from these examples. 
            The model adjusts its internal settings (like an apprentice learning a craft) to get better and better at predicting your target based on the features you provided. 
            This process involves a lot of calculations, which is why it can take some time!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWhatIsTrainingModal} color="primary" autoFocus>
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default TrainingComponent;