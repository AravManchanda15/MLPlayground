import React, { useState } from 'react';

import * as tf from '@tensorflow/tfjs';
import DataSourceComponent from './components/DataSourceComponent';
import ModelConfigurationComponent from './components/ModelConfigurationComponent';
import TrainingComponent from './components/TrainingComponent';
import ResultsComponent from './components/ResultsComponent';
import PredictionComponent from './components/PredictionComponent';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3498db',
    },
    secondary: {
      main: '#2ecc71',
    },
    background: {
      default: '#f4f7f6',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      color: '#2c3e50',
      marginBottom: '20px',
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
      color: '#3498db',
      marginTop: '30px',
      marginBottom: '15px',
    }
  },
});

// Small constant to prevent division by zero
const EPSILON = 1e-7;


function App() {
  const [rawData, setRawData] = useState(null); // Parsed CSV data
  const [headers, setHeaders] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const [config, setConfig] = useState({
    targetColumn: '',
    featureColumns: [],
    modelType: 'simple', // 'simple' or 'medium'
  });

  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainedModel, setTrainedModel] = useState(null);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [results, setResults] = useState(null); // { mae, rSquared, predictions }

  const MAX_ROWS = 5000;
  const MAX_COLS = 20;

  const identifyNumericColumns = (data, currentHeaders) => {
    if (!data || data.length === 0) return [];
    const numericCols = [];
    currentHeaders.forEach(header => {
      // Check a sample of rows (e.g., first 10 or up to 100)
      const sampleSize = Math.min(100, data.length);
      let isNumeric = true;
      for (let i = 0; i < sampleSize; i++) {
        const value = data[i][header];
        if (value === null || value === undefined || String(value).trim() === '' || isNaN(parseFloat(value))) {
          isNumeric = false;
          break;
        }
      }
      if (isNumeric) {
        numericCols.push(header);
      }
    });
    return numericCols;
  };

  const handleDataLoaded = (data, file) => {
    setTrainedModel(null);
    setResults(null);
    setConfig({ targetColumn: '', featureColumns: [], modelType: 'simple' });
    setTrainingLogs([]);
    setTrainingProgress(0);


    if (!data || data.length === 0) {
        // DataSourceComponent might call this with null if parsing fails before this check
        // setError is likely already set by DataSourceComponent in such cases
        if (!error) setError("No data loaded or data is empty.");
        setRawData(null);
        setHeaders([]);
        setNumericColumns([]);
        setFileName('');
        return;
    }


    if (data.length > MAX_ROWS) {
      setError(`Dataset is too large (${data.length} rows). Please choose a smaller one (max ${MAX_ROWS} rows).`);
      setRawData(null);
      setHeaders([]);
      setNumericColumns([]);
      setFileName('');
      return;
    }
    if (data.length > 0 && Object.keys(data[0]).length > MAX_COLS) {
      setError(`Dataset has too many columns (${Object.keys(data[0]).length} columns). Please choose a simpler one (max ${MAX_COLS} columns).`);
      setRawData(null);
      setHeaders([]);
      setNumericColumns([]);
      setFileName('');
      return;
    }

    const currentHeaders = Object.keys(data[0]);
    setRawData(data);
    setHeaders(currentHeaders);
    setNumericColumns(identifyNumericColumns(data, currentHeaders));
    setFileName(file ? file.name : 'sample dataset');
    console.log("Data loaded and processed:", { data, currentHeaders });
  };

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
    setTrainedModel(null); // Reset model if config changes
    setResults(null);
  };

  const trainModel = async () => {
    if (!rawData || !config.targetColumn || config.featureColumns.length === 0) {
      setError("Please select data, a target column, and at least one feature column.");
      return;
    }
    setError('');
    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingLogs([]);
    setTrainedModel(null);
    setResults(null);

    // Artificial delay to simulate training and show progress
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Prepare data
      const targetData = rawData.map(row => parseFloat(row[config.targetColumn]));
      const featureData = rawData.map(row =>
        config.featureColumns.map(col => parseFloat(row[col]))
      );

      // Filter out rows with NaNs after conversion attempt
      const cleanedFeatures = [];
      const cleanedTarget = [];

      for (let i = 0; i < featureData.length; i++) {
          // Check if all feature values in the row are numbers and target is a number
          if (featureData[i].every(val => !isNaN(val)) && !isNaN(targetData[i])) {
              cleanedFeatures.push(featureData[i]);
              cleanedTarget.push(targetData[i]);
          }
      }
      
      if (cleanedFeatures.length === 0 || cleanedTarget.length === 0) {
        throw new Error("No valid numeric data found for selected features and target after cleaning. Please check your data and selections, or ensure columns contain only numbers.");
      }

      const featureTensor = tf.tensor2d(cleanedFeatures);
      const targetTensor = tf.tensor2d(cleanedTarget, [cleanedTarget.length, 1]);

      // Normalize features (MinMax scaling)
      const featureMin = featureTensor.min(0);
      const featureMax = featureTensor.max(0);
      const normalizedFeatureTensor = featureTensor.sub(featureMin).div(featureMax.sub(featureMin).add(EPSILON)); // Use EPSILON

      // Normalize target (MinMax scaling)
      const targetMin = targetTensor.min();
      const targetMax = targetTensor.max();
      const normalizedTargetTensor = targetTensor.sub(targetMin).div(targetMax.sub(targetMin).add(EPSILON)); // Use EPSILON


      // Define model based on config.modelType
      const model = tf.sequential();
      if (config.modelType === 'simple') {
        model.add(tf.layers.dense({ inputShape: [config.featureColumns.length], units: 1 }));
      } else { // medium model
        model.add(tf.layers.dense({ inputShape: [config.featureColumns.length], units: 32, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1 }));
      }

      model.compile({
        optimizer: tf.train.adam(0.01), // Learning rate
        loss: 'meanSquaredError',
      });

      // Train model
      const epochs = config.modelType === 'simple' ? 50 : 100;
      const batchSize = 32;

      await model.fit(normalizedFeatureTensor, normalizedTargetTensor, {
        epochs: epochs,
        batchSize: batchSize,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            setTrainingProgress(((epoch + 1) / epochs) * 100);
            setTrainingLogs(prevLogs => [...prevLogs, `Epoch ${epoch + 1}/${epochs} - Loss: ${logs.loss.toFixed(4)}`]);
            // console.log(`Epoch ${epoch + 1}/${epochs} - Loss: ${logs.loss.toFixed(4)}`);
          }
        }
      });
      
      // Store normalization parameters for prediction
      model.normalizationParams = {
        featureMin, featureMax, targetMin, targetMax
      };

      setTrainedModel(model);
      setIsTraining(false);
      setTrainingProgress(100);

      // Generate results after training
      generateResults(model, normalizedFeatureTensor, targetTensor, targetMin, targetMax);

    } catch (e) {
      console.error("Training error:", e);
      setError(`Training failed: ${e.message}`);
      setIsTraining(false);
      setTrainedModel(null);
    }
  };

  const generateResults = (model, normalizedFeatureTensor, originalTargetTensor, targetMin, targetMax) => {
    tf.tidy(() => {
      const predictionsTensorNormalized = model.predict(normalizedFeatureTensor);
      // Denormalize predictions
      const predictionsTensor = predictionsTensorNormalized.mul(targetMax.sub(targetMin)).add(targetMin);

      const actualValues = originalTargetTensor.arraySync().flat();
      const predictedValues = predictionsTensor.arraySync().flat();

      if (actualValues.length !== predictedValues.length || actualValues.length === 0) {
        console.error("Mismatch in actual and predicted values length or no data to evaluate.");
        setError("Could not generate results due to data mismatch or insufficient data.");
        setResults(null); // Clear previous results
        return;
      }
      
      // Calculate Mean Absolute Error (MAE)
      let maeSum = 0;
      for (let i = 0; i < actualValues.length; i++) {
        maeSum += Math.abs(actualValues[i] - predictedValues[i]);
      }
      const mae = actualValues.length > 0 ? maeSum / actualValues.length : 0;

      // Calculate R-squared
      const meanActual = actualValues.reduce((a, b) => a + b, 0) / actualValues.length;
      const ssTot = actualValues.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);
      const ssRes = actualValues.reduce((sum, val, i) => sum + Math.pow(val - predictedValues[i], 2), 0);
      
      // Handle ssTot = 0 case (e.g., all target values are the same)
      const rSquared = ssTot === 0 ? (ssRes === 0 ? 1 : 0) : 1 - (ssRes / ssTot);
      
      const plotData = actualValues.map((actual, i) => ({
          actual: actual,
          predicted: predictedValues[i]
      }));

      setResults({
        mae,
        rSquared,
        plotData,
        targetColumn: config.targetColumn
      });
    });
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Typography variant="h1" component="h1" gutterBottom align="center">
          ML Playground
        </Typography>

        {error && (
          <Alert severity="error" style={{ marginBottom: '20px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <div className="section">
          <DataSourceComponent
            onDataLoaded={handleDataLoaded}
            setGlobalError={setError}
          />
        </div>

        {rawData && headers.length > 0 && (
          <>
            <div className="section">
              <ModelConfigurationComponent
                headers={headers}
                numericColumns={numericColumns}
                onConfigChange={handleConfigChange}
                currentConfig={config}
              />
            </div>

            <div className="section">
              <TrainingComponent
                onTrain={trainModel}
                isTraining={isTraining}
                progress={trainingProgress}
                logs={trainingLogs}
                disabled={!config.targetColumn || config.featureColumns.length === 0 || numericColumns.length === 0}
              />
            </div>
          </>
        )}

        {results && trainedModel && (
           <div className="section">
            <ResultsComponent results={results} />
          </div>
        )}

        {trainedModel && results && (
          <div className="section">
            <PredictionComponent
              model={trainedModel}
              featureColumns={config.featureColumns}
              targetColumn={config.targetColumn}
              // numericColumns is not directly used by PredictionComponent for its core logic, 
              // but could be useful for extended input validation/guidance if needed.
              // For now, its direct utility in PredictionComponent is minimal.
              // numericColumns={numericColumns} 
            />
          </div>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;