import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

// Small constant to prevent division by zero
const EPSILON = 1e-7;

function PredictionComponent({ model, featureColumns, targetColumn }) {
  const [inputValues, setInputValues] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize inputValues state with empty strings for each feature column
    const initialInputs = {};
    if (featureColumns && Array.isArray(featureColumns)) {
      featureColumns.forEach(col => {
        initialInputs[col] = '';
      });
    }
    setInputValues(initialInputs);
    setPrediction(null); // Reset prediction when features change (e.g. new model)
    setError('');
  }, [featureColumns]); // Re-run when featureColumns array changes

  const handleInputChange = (columnName, value) => {
    setInputValues(prev => ({ ...prev, [columnName]: value }));
    setPrediction(null); // Clear old prediction on new input
    setError('');
  };

  const handlePredict = () => {
    setError('');
    setPrediction(null);

    if (!model || !model.normalizationParams) {
        setError("Model or its normalization parameters are not available. Please retrain the model.");
        return;
    }
     if (!featureColumns || featureColumns.length === 0) {
        setError("Feature columns are not defined. Cannot make a prediction.");
        return;
    }


    // Validate inputs
    const featureValues = [];
    for (const col of featureColumns) {
      const val = inputValues[col];
      if (val === null || val === undefined || String(val).trim() === '') {
        setError(`Please provide a value for "${col}".`);
        return;
      }
      const numVal = parseFloat(val);
      if (isNaN(numVal)) {
        setError(`Invalid input for "${col}". Please enter a numeric value.`);
        return;
      }
      featureValues.push(numVal);
    }


    const { featureMin, featureMax, targetMin, targetMax } = model.normalizationParams;

    // Ensure normalizationParams are valid tensors or can be converted
    if (!(featureMin instanceof tf.Tensor) || !(featureMax instanceof tf.Tensor) ||
        !(targetMin instanceof tf.Tensor) || !(targetMax instanceof tf.Tensor)) {
        setError("Normalization parameters are not valid Tensors. Please retrain the model.");
        console.error("Invalid normalizationParams:", model.normalizationParams);
        return;
    }


    try {
      const predictionResult = tf.tidy(() => {
        const inputTensor = tf.tensor2d([featureValues]);
        
        let normalizedInputTensor;
        // Ensure featureMin and featureMax are correctly dimensioned for broadcasting or element-wise ops
        // This check assumes featureMin/Max are 1D tensors with size equal to number of features
        if (featureMin.shape.length === 1 && featureMin.shape[0] === inputTensor.shape[1] &&
            featureMax.shape.length === 1 && featureMax.shape[0] === inputTensor.shape[1]) {
            normalizedInputTensor = inputTensor.sub(featureMin).div(featureMax.sub(featureMin).add(EPSILON)); // Use EPSILON
        } else {
            // Fallback or error if shapes are not as expected.
            // This scenario implies an issue during model training/saving normalization params.
            console.error("Mismatch in feature normalization tensor shapes or featureMin/Max are not 1D tensors.", 
                          "FeatureMin shape:", featureMin.shape, 
                          "FeatureMax shape:", featureMax.shape,
                          "InputTensor shape:", inputTensor.shape);
            setError("Error in applying feature normalization due to shape mismatch. Please retrain model.");
            return null; // Indicate error by returning null
        }
        
        const normalizedPrediction = model.predict(normalizedInputTensor);
        
        // Denormalize the prediction
        const finalPrediction = normalizedPrediction.mul(targetMax.sub(targetMin)).add(targetMin);
        return finalPrediction.arraySync()[0][0]; // Get the single predicted value
      });

      if (predictionResult === null) { // Check if an error occurred during tidy
          // Error already set by the tidy block
          return;
      }
      setPrediction(predictionResult);

    } catch (e) {
      console.error("Prediction error:", e);
      setError(`Prediction failed: ${e.message}`);
    }
  };

  if (!model) return null;
  
  const formatTargetName = (colName) => {
    if (!colName) return "Value";
    return colName.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/_/g, " ").split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  const formattedTargetColumn = formatTargetName(targetColumn);

  return (
    <Paper elevation={2} className="container" sx={{ padding: 3 }}>
      <Typography variant="h2" component="h3" gutterBottom>
        5. Make a Prediction
      </Typography>
      <Typography variant="body1" paragraph>
        Enter values for the features below to get a live prediction for {formattedTargetColumn}.
      </Typography>

      <Box component="form" noValidate autoComplete="off">
        {featureColumns && featureColumns.map(col => (
          <TextField
            key={col}
            label={col}
            variant="outlined"
            value={inputValues[col] || ''} // Ensure controlled component
            onChange={(e) => handleInputChange(col, e.target.value)}
            type="number" // Use number type for better UX, but still parse parseFloat
            fullWidth
            margin="normal"
          />
        ))}
        
        {error && (
            <Alert severity="error" sx={{marginTop: 1, marginBottom:1}}>{error}</Alert>
        )}

        <Button 
            variant="contained" 
            color="success" 
            onClick={handlePredict} 
            sx={{ marginTop: 2, padding: '10px', fontSize: '1.1rem'}} 
            fullWidth
            disabled={!featureColumns || featureColumns.length === 0}
        >
          Predict {formattedTargetColumn}
        </Button>
      </Box>

      {prediction !== null && (
        <Box sx={{ marginTop: 3, padding: 2, backgroundColor: '#e8f5e9', borderRadius: '4px'}}>
          <Typography variant="h5" component="p" color="#2e7d32">
            Predicted {formattedTargetColumn}: {prediction.toFixed(2)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default PredictionComponent;