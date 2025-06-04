import React, { useState } from 'react';
import Papa from 'papaparse';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// Construct paths using process.env.PUBLIC_URL
// This ensures they work correctly locally and when deployed.
// Assumes sample1.csv, sample2.csv, sample3.csv are in the 'public' folder.
const publicUrl = process.env.PUBLIC_URL || ''; // Fallback to empty string if PUBLIC_URL is undefined

const sampleDatasets = [
  { name: "Predict Car MPG", path: `${publicUrl}/sample1.csv` },
  { name: "Predict Medical Costs", path: `${publicUrl}/sample2.csv` },
  { name: "Predict Taco Sales", "path": `${publicUrl}/sample3.csv` },
];

function DataSourceComponent({ onDataLoaded, setGlobalError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [dataPreview, setDataPreview] = useState({ headers: [], rows: [] }); // State for data preview

  const parseCSV = (fileOrPath, isPath) => {
    setIsLoading(true);
    setGlobalError(''); // Clear previous global errors
    console.log(`Parsing CSV from: ${fileOrPath}, isPath: ${isPath}`); // Log the path being parsed

    Papa.parse(fileOrPath, {
      download: isPath, // True if it's a path, false if it's a File object
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep all as strings initially, App.js will handle numeric conversion checks
      complete: (results) => {
        setIsLoading(false);
        console.log("Papa Parse complete. Results:", results); // Log the full results
        if (results.errors && results.errors.length > 0) {
          console.error("Parsing errors:", results.errors);
          const errorMessages = results.errors.map(err => `${err.message} (Row: ${err.row})`).join('; ');
          setGlobalError(`Error parsing CSV: ${errorMessages}. Please check the CSV format or file path.`);
          onDataLoaded(null, null); // Ensure App.js knows data loading failed
          return;
        }
        if (!results.data || results.data.length === 0) {
            setGlobalError("CSV file is empty or could not be parsed correctly (no data rows found).");
            onDataLoaded(null, null); // Ensure App.js knows data loading failed
            return;
        }
        // Check if the first row looks like HTML (a common failure mode if path is wrong)
        if (results.data.length > 0) {
            const firstRowKeys = Object.keys(results.data[0]);
            if (firstRowKeys.some(key => key.toLowerCase().includes('<html') || key.toLowerCase().includes('<!doctype'))) {
                console.error("Parsed data looks like HTML, not CSV. Path issue likely.", results.data[0]);
                setGlobalError("Failed to load sample dataset: The file path seems incorrect, and an HTML page was loaded instead of a CSV. Please check console and file paths.");
                onDataLoaded(null, null);
                return;
            }
        }
        onDataLoaded(results.data, isPath ? { name: fileOrPath.substring(fileOrPath.lastIndexOf('/') + 1) } : fileOrPath);
        // Prepare data for preview
        if (results.data && results.data.length > 0) {
          const previewHeaders = results.meta.fields || Object.keys(results.data[0]);
          const previewRows = results.data.slice(0, 5); // Show first 5 rows
          setDataPreview({ headers: previewHeaders, rows: previewRows });
        } else {
          setDataPreview({ headers: [], rows: [] }); // Clear preview if no data
        }
      },
      error: (error) => {
        setIsLoading(false);
        console.error("Papa Parse critical error:", error);
        setGlobalError(`Failed to parse CSV: ${error.message}. This could be a network issue or incorrect file path for sample data.`);
        onDataLoaded(null, null); // Ensure App.js knows data loading failed
        setDataPreview({ headers: [], rows: [] }); // Clear preview on error
      }
    });
  };

  const handleSampleDatasetClick = (datasetPath) => {
    setDataPreview({ headers: [], rows: [] }); // Clear preview before loading new sample
    parseCSV(datasetPath, true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setDataPreview({ headers: [], rows: [] }); // Clear preview before loading new file
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
    <Paper elevation={2} className="container" sx={{ padding: 3, maxWidth: '80%', marginX: 'auto' }}> {/* MODIFIED: Added maxWidth and marginX */}
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

      {/* Data Preview Table */}
      {dataPreview.rows.length > 0 && (
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h6" gutterBottom>Data Preview (First 5 Rows):</Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {dataPreview.headers.map((header) => (
                    <TableCell key={header} sx={{ fontWeight: 'bold' }}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dataPreview.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {dataPreview.headers.map((header) => (
                      <TableCell key={`${rowIndex}-${header}`}>{String(row[header])}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Paper> 
  );
}

export default DataSourceComponent;