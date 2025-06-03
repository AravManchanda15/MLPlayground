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
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
    <Paper elevation={2} className="container" sx={{ padding: { xs: 1.5, sm: 2, md: 2.5 }, maxWidth: '80%', marginX: 'auto' }}> {/* MODIFIED: Added maxWidth and marginX */}
      <Typography variant="h2" component="h3" gutterBottom>
        2. Configure Your Model
      </Typography>

      <Box sx={{ marginBottom: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 0.5 }}>
          <InputLabel htmlFor="target-column-select" sx={{ marginRight: 0.5, position: 'relative', transform: 'none', fontSize: '1rem', color: 'text.primary' }}>Column to Predict (Target)</InputLabel>
          <Tooltip title="This is the specific thing you want the model to learn to predict. It must be a column with numbers." placement="top" arrow>
            <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help', color: 'text.secondary' }} />
          </Tooltip>
        </Box>
        <FormControl fullWidth margin="none">
          <Select
            id="target-column-select"
            value={currentConfig.targetColumn}
            onChange={handleTargetChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Column to Predict (Target)' }}
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
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 0.5 }}>
            <InputLabel htmlFor="feature-columns-select" sx={{ marginRight: 0.5, position: 'relative', transform: 'none', fontSize: '1rem', color: 'text.primary' }}>Columns to Use for Prediction (Features)</InputLabel>
            <Tooltip title="These are the pieces of information the model will use to try and predict the Target. You can select one or more numeric columns that are different from the target." placement="top" arrow>
              <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help', color: 'text.secondary' }} />
            </Tooltip>
          </Box>
          <FormControl fullWidth margin="none">
            <Select
              id="feature-columns-select"
              multiple
              value={currentConfig.featureColumns}
              onChange={handleFeaturesChange}
              input={<OutlinedInput />}
              renderValue={(selected) => selected.join(', ')}
              MenuProps={MenuProps}
              displayEmpty
              inputProps={{ 'aria-label': 'Columns to Use for Prediction (Features)' }}
            >
               <MenuItem value="" disabled><em>Select numeric features</em></MenuItem>
              {availableFeatures.filter(col => numericColumns.includes(col)).map(col => (
                <MenuItem key={col} value={col}>
                  <Checkbox checked={currentConfig.featureColumns.indexOf(col) > -1} />
                  <ListItemText primary={col} />
                </MenuItem>
              ))}
               {availableFeatures.filter(col => !numericColumns.includes(col)).map(col => (
                <MenuItem key={col} value={col} disabled>
                  <Checkbox checked={false} disabled />
                  <ListItemText primary={`${col} (non-numeric)`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Box sx={{ marginBottom: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 0.5 }}>
            <InputLabel htmlFor="model-type-select" sx={{ marginRight: 0.5, position: 'relative', transform: 'none', fontSize: '1rem', color: 'text.primary' }}>Model Type</InputLabel>
            <Tooltip title="Choose the complexity of the model. 'Simple' is faster and easier to understand (like a basic linear model), 'Medium' uses a small neural network and might be more accurate but takes longer to learn." placement="top" arrow>
                <HelpOutlineIcon fontSize="small" sx={{ cursor: 'help', color: 'text.secondary' }} />
            </Tooltip>
        </Box>
        <FormControl fullWidth margin="none">
          <Select
            id="model-type-select"
            value={currentConfig.modelType}
            onChange={handleModelTypeChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Model Type' }}
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