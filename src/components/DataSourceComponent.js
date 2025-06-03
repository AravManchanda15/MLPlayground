import React, { useState } from 'react';
import Papa from 'papaparse';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

const sampleDatasets = [
  { name: "Predict Car MPG", path: './sample1.csv' }, // Assumes sample1.csv is in public folder
  { name: "Predict Medical Costs", path: './sample2.csv' }, // Assumes sample2.csv is in public folder
  { name: "Predict House Prices", path: './sample3.csv' }, // Assumes sample3.csv is in public folder
];

function DataSourceComponent({ onDataLoaded, setGlobalError }) {
  const [isLoading, setIsLoading] = useState(false);

  const parseCSV = (fileOrPath, isPath) => {
    setIsLoading(true);
    setGlobalError(''); // Clear previous global errors

    Papa.parse(fileOrPath, {
      download: isPath, // True if it's a path, false if it's a File object
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep all as strings initially, App.js will handle numeric conversion checks
      complete: (results) => {
        setIsLoading(false);
        if (results.errors && results.errors.length > 0) {
          console.error("Parsing errors:", results.errors);
          const errorMessages = results.errors.map(err => `${err.message} (Row: ${err.row})`).join('; ');
          setGlobalError(`Error parsing CSV: ${errorMessages}. Please check the CSV format.`);
          onDataLoaded(null, null);
          return;
        }
        if (!results.data || results.data.length === 0) {
            setGlobalError("CSV file is empty or could not be parsed correctly.");
            onDataLoaded(null, null);
            return;
        }
        // console.log("Parsed data:", results.data);
        // console.log("Headers:", results.meta.fields);
        onDataLoaded(results.data, isPath ? { name: fileOrPath.split('/').pop() } : fileOrPath);
      },
      error: (error) => {
        setIsLoading(false);
        console.error("Papa Parse error:", error);
        setGlobalError(`Failed to parse CSV: ${error.message}`);
        onDataLoaded(null, null);
      }
    });
  };

  const handleSampleDatasetClick = (datasetPath) => {
    parseCSV(datasetPath, true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith('.csv')) {
        setGlobalError("Invalid file type. Please upload a CSV file.");
        onDataLoaded(null, null);
        event.target.value = null; // Reset file input
        return;
      }
      parseCSV(file, false);
    }
    event.target.value = null; // Reset file input to allow re-upload of the same file name
  };

  return (
    <Paper elevation={2} className="container" sx={{ padding: 3 }}>
      <Typography variant="h2" component="h3" gutterBottom>
        1. Load Your Data
      </Typography>
      <Typography variant="body1" paragraph>
        Choose one of the sample datasets or upload your own CSV file to get started.
      </Typography>
      
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6" gutterBottom>Select a Sample Dataset:</Typography>
        {sampleDatasets.map(dataset => (
          <Button
            key={dataset.name}
            variant="contained"
            onClick={() => handleSampleDatasetClick(dataset.path)}
            disabled={isLoading}
            sx={{ margin: '0 8px 8px 0' }}
          >
            {dataset.name}
          </Button>
        ))}
      </Box>

      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6" gutterBottom>Or Upload Your Own CSV:</Typography>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isLoading}
          id="csv-upload-button"
          style={{ display: 'none' }} // Hide the default input
        />
        <label htmlFor="csv-upload-button">
            <Button variant="outlined" component="span" disabled={isLoading}>
                Upload CSV File
            </Button>
        </label>
        <Typography variant="caption" display="block" sx={{marginTop: 1}}>
            Max 5,000 rows, 20 columns. Assumes clean data (headers, no missing values).
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
          <CircularProgress size={24} sx={{ marginRight: 1 }} />
          <Typography>Loading and parsing data...</Typography>
        </Box>
      )}
    </Paper>
  );
}

export default DataSourceComponent; 