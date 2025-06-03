import React, { useState, useEffect } from 'react';

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
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import './App.css';
import { analyzeModelPerformance } from './utils';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64b5f6',
    },
    secondary: {
      main: '#81c784',
    },
    background: {
      default: '#121212',
      paper: 'rgba(45, 55, 72, 0.9)',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#B0B0B0',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.8rem',
      fontWeight: 600,
      color: '#E0E0E0',
      marginBottom: '25px',
      textAlign: 'center',
    },
    h2: {
      fontSize: '1.7rem',
      fontWeight: 500,
      color: '#bbdefb',
      marginTop: '25px',
      marginBottom: '15px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      paddingBottom: '8px',
    },
    h3: {
        fontSize: '1.4rem',
        fontWeight: 500,
        color: '#E0E0E0',
        marginBottom: '10px',
    },
    body1: {
        color: '#E0E0E0',
    },
    caption: {
        color: '#B0B0B0',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          padding: '8px 18px',
        },
        containedPrimary: {
            backgroundColor: '#64b5f6',
            color: '#000',
            '&:hover': {
                backgroundColor: '#42a5f5',
            }
        },
        containedSecondary: {
            backgroundColor: '#81c784',
            color: '#000',
             '&:hover': {
                backgroundColor: '#66bb6a',
            }
        }
      }
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(30, 40, 50, 0.92)',
                padding: '20px',
                // ADDED: Ensure Recharts text inside Paper components is visible
                '& .recharts-text, & .recharts-label, & .recharts-legend-item-text, & .recharts-cartesian-axis-tick-value': {
                    fill: '#B0B0B0', // Match theme.palette.text.secondary
                },
            }
        }
    },
    MuiInputLabel: {
        styleOverrides: {
            root: {
                color: '#B0B0B0',
            }
        }
    },
    MuiOutlinedInput: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(255,255,255,0.05)',
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.23)',
                },
                 '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#64b5f6',
                },
            }
        }
    }
  }
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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false); // State for welcome modal

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
      generateResults(model, normalizedFeatureTensor, targetTensor, targetMin, targetMax, featureTensor);

    } catch (e) {
      console.error("Training error:", e);
      setError(`Training failed: ${e.message}`);
      setIsTraining(false);
      setTrainedModel(null);
    }
  };

  const generateResults = (model, normalizedFeatureTensor, originalTargetTensor, targetMin, targetMax, originalFeatureTensor) => {
    tf.tidy(() => {
      const predictionsTensorNormalized = model.predict(normalizedFeatureTensor);
      // Denormalize predictions
      const predictionsTensor = predictionsTensorNormalized.mul(targetMax.sub(targetMin).add(EPSILON)).add(targetMin);

      const actualValues = originalTargetTensor.arraySync().flat();
      const predictedValues = predictionsTensor.arraySync().flat();

      // Calculate MAE
      const mae = tf.metrics.meanAbsoluteError(originalTargetTensor, predictionsTensor).dataSync()[0];

      // Calculate R-squared
      const meanTarget = originalTargetTensor.mean();
      const totalSumOfSquares = originalTargetTensor.sub(meanTarget).square().sum();
      const residualSumOfSquares = originalTargetTensor.sub(predictionsTensor).square().sum();
      const rSquared = tf.scalar(1).sub(residualSumOfSquares.div(totalSumOfSquares.add(EPSILON))).dataSync()[0];

      // Calculate MSE
      const mse = tf.metrics.meanSquaredError(originalTargetTensor, predictionsTensor).dataSync()[0];
      // Calculate RMSE
      const rmse = Math.sqrt(mse);

      // Calculate target statistics
      const targetValuesArray = originalTargetTensor.arraySync().flat();
      const targetMean = targetValuesArray.reduce((acc, val) => acc + val, 0) / targetValuesArray.length;
      const targetMaxVal = Math.max(...targetValuesArray);
      const targetMinVal = Math.min(...targetValuesArray);
      const targetRange = targetMaxVal - targetMinVal;
      
      const targetStats = {
        targetMean: targetMean === 0 ? EPSILON : targetMean, // Avoid division by zero in utils
        targetRange: targetRange === 0 ? EPSILON : targetRange, // Avoid division by zero in utils
        targetMax: targetMaxVal,
        targetMin: targetMinVal
      };

      const rawMetrics = { mae, rSquared, mse, rmse };
      const analysisOutput = analyzeModelPerformance(rawMetrics, targetStats, config.targetColumn);

      const plotData = actualValues.map((actual, i) => ({
        actual: actual,
        predicted: predictedValues[i],
      }));

      setResults({
        mae,
        rSquared,
        mse,
        rmse,
        plotData,
        targetColumn: config.targetColumn,
        analysis: analysisOutput,
        inputFeatures: config.featureColumns,
        actualValues,
        predictedValues
      });
    });
  };

  // Effect to check for first visit and show welcome modal
  useEffect(() => {
    const alreadyVisited = localStorage.getItem('hasVisitedMLPlayground');
    if (!alreadyVisited) {
      setShowWelcomeModal(true);
      localStorage.setItem('hasVisitedMLPlayground', 'true');
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    // Here you could trigger a tour if a "Show Me How" button was clicked
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md"> {/* Modified: Changed maxWidth from "lg" to "md" for smaller overall container */}
        <Typography variant="h1" component="h1" gutterBottom align="center">
          ML Playground
        </Typography>

        {/* Welcome Modal */}
        <Dialog
          open={showWelcomeModal}
          onClose={handleCloseWelcomeModal}
          aria-labelledby="welcome-dialog-title"
          aria-describedby="welcome-dialog-description"
        >
          <DialogTitle id="welcome-dialog-title">{"Welcome to ML Playground!"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="welcome-dialog-description">
              Learn the basics of training a machine learning model by uploading your data (or using our samples), configuring a model, and seeing its predictions. No prior experience needed!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseWelcomeModal} color="primary" autoFocus>
              Let's Get Started!
            </Button>
            {/* Optionally, add a "Show Me How" button here */}
          </DialogActions>
        </Dialog>

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