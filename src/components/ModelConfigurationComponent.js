import React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function ModelConfigurationComponent({ headers, numericColumns, onConfigChange, currentConfig }) {

  const handleTargetChange = (event) => {
    onConfigChange({ 
      ...currentConfig, 
      targetColumn: event.target.value,
      // Reset feature columns if the new target is part of the current features
      featureColumns: currentConfig.featureColumns.includes(event.target.value) 
                      ? currentConfig.featureColumns.filter(col => col !== event.target.value)
                      : currentConfig.featureColumns
    });
  };

  const handleFeaturesChange = (event) => {
    const { target: { value } } = event;
    onConfigChange({ 
      ...currentConfig, 
      featureColumns: typeof value === 'string' ? value.split(',') : value 
    });
  };

  const handleModelTypeChange = (event) => {
    onConfigChange({ ...currentConfig, modelType: event.target.value });
  };

  const availableFeatures = headers.filter(header => header !== currentConfig.targetColumn);

  return (
    <Paper elevation={2} className="container" sx={{ padding: 3 }}>
      <Typography variant="h2" component="h3" gutterBottom>
        2. Configure Your Model
      </Typography>

      <Box sx={{ marginBottom: 2 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="target-column-label">Column to Predict (Target)</InputLabel>
          <Select
            labelId="target-column-label"
            value={currentConfig.targetColumn}
            label="Column to Predict (Target)"
            onChange={handleTargetChange}
          >
            <MenuItem value="" disabled><em>Select a numeric column</em></MenuItem>
            {numericColumns.map(col => (
              <MenuItem key={col} value={col}>{col}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {numericColumns.length === 0 && headers.length > 0 && (
            <Typography color="error" variant="caption">
                No numeric columns detected in the dataset. Prediction tasks typically require a numeric target.
            </Typography>
        )}
      </Box>

      {currentConfig.targetColumn && (
        <Box sx={{ marginBottom: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="feature-columns-label">Columns to Use for Prediction (Features)</InputLabel>
            <Select
              labelId="feature-columns-label"
              multiple
              value={currentConfig.featureColumns}
              onChange={handleFeaturesChange}
              input={<OutlinedInput label="Columns to Use for Prediction (Features)" />}
              renderValue={(selected) => selected.join(', ')}
              MenuProps={MenuProps}
            >
              {availableFeatures.map(col => (
                <MenuItem key={col} value={col}>
                  <Checkbox checked={currentConfig.featureColumns.indexOf(col) > -1} />
                  <ListItemText primary={col} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Box sx={{ marginBottom: 2 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="model-type-label">Model Type</InputLabel>
          <Select
            labelId="model-type-label"
            value={currentConfig.modelType}
            label="Model Type"
            onChange={handleModelTypeChange}
          >
            <MenuItem value="simple">Simple Model (Fast, Linear Regression-like)</MenuItem>
            <MenuItem value="medium">Medium Model (More Accurate, Basic Neural Network)</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
}

export default ModelConfigurationComponent; 