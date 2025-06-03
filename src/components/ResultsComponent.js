import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const CustomTooltipContent = ({ active, payload, label, targetColumn }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ padding: '10px', background: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="caption">{`Actual ${targetColumn}: ${payload[0].payload.actual.toFixed(2)}`}</Typography><br/>
          <Typography variant="caption">{`Predicted ${targetColumn}: ${payload[0].payload.predicted.toFixed(2)}`}</Typography>
        </Paper>
      );
    }
    return null;
  };

function ResultsComponent({ results }) {
  if (!results) return null;

  const { mae, rSquared, plotData, targetColumn } = results;

  const formatTargetName = (colName) => {
    if (!colName) return "Value";
    return colName.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/_/g, " ").split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  
  const formattedTargetColumn = formatTargetName(targetColumn);

  const maeTooltipText = `Mean Absolute Error (MAE) shows the average size of the errors in your model's predictions, ignoring their direction. A MAE of ${mae.toFixed(2)} means, on average, the model's predictions for ${formattedTargetColumn} were off by approximately ${mae.toFixed(2)}. Lower is generally better.`;
  const rSquaredTooltipText = `R-squared (Coefficient of Determination) indicates how much of the variation in the ${formattedTargetColumn} your model can explain. An R-squared of ${rSquared.toFixed(2)} (or ${(rSquared * 100).toFixed(1)}%) means the model explains about ${(rSquared * 100).toFixed(1)}% of the variance. Closer to 1 (or 100%) is generally better.`;

  return (
    <Paper elevation={2} className="container" sx={{ padding: 3 }}>
      <Typography variant="h2" component="h3" gutterBottom>
        4. Model Performance
      </Typography>

      <Box sx={{ marginBottom: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-around' }}>
        <Box sx={{ textAlign: 'center', marginBottom: { xs: 2, md: 0 } }}>
          <Typography variant="h6">
            Mean Absolute Error (MAE)
            <Tooltip title={<Typography variant="body2">{maeTooltipText}</Typography>} placement="top" arrow>
              <HelpOutlineIcon fontSize="small" sx={{ verticalAlign: 'middle', marginLeft: 0.5, cursor: 'help' }} />
            </Tooltip>
          </Typography>
          <Typography variant="h4" color="primary">{mae.toFixed(3)}</Typography>
          <Typography variant="caption">Avg. prediction error for {formattedTargetColumn}</Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">
            R-squared (R²)
            <Tooltip title={<Typography variant="body2">{rSquaredTooltipText}</Typography>} placement="top" arrow>
              <HelpOutlineIcon fontSize="small" sx={{ verticalAlign: 'middle', marginLeft: 0.5, cursor: 'help' }} />
            </Tooltip>
          </Typography>
          <Typography variant="h4" color="primary">{rSquared.toFixed(3)}</Typography>
          <Typography variant="caption">Model fit ({ (rSquared * 100).toFixed(1) }%)</Typography>
        </Box>
      </Box>
      
      <Typography variant="h6" gutterBottom sx={{ marginTop: 3, textAlign: 'center'}}>
        Actual vs. Predicted {formattedTargetColumn}
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="actual" name={`Actual ${formattedTargetColumn}`} unit="">
            <Label value={`Actual ${formattedTargetColumn}`} offset={-30} position="insideBottom" />
          </XAxis>
          <YAxis type="number" dataKey="predicted" name={`Predicted ${formattedTargetColumn}`} unit="">
            <Label value={`Predicted ${formattedTargetColumn}`} angle={-90} offset={-20} position="insideLeft" style={{textAnchor: 'middle'}}/>
          </YAxis>
          <RechartsTooltip content={<CustomTooltipContent targetColumn={formattedTargetColumn} />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend verticalAlign="top" height={36}/>
          <Scatter name="Predictions" data={plotData} fill="#3498db" shape="circle" />
        </ScatterChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default ResultsComponent; 