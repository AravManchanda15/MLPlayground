import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Label
} from 'recharts';

import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

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

  const { mae, rSquared, mse, rmse, plotData, targetColumn, analysis } = results;

  const formatTargetName = (colName) => {
    if (!colName) return "Value";
    return colName
      .replace(/[^a-zA-Z0-9 ]/g, " ")
      .replace(/_/g, " ")
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formattedTargetColumn = formatTargetName(targetColumn);

  const maeTooltipText = `Mean Absolute Error (MAE) shows the average size of the errors in your model’s predictions, ignoring their direction. A MAE of ${mae.toFixed(2)} means, on average, the model’s predictions for ${formattedTargetColumn} were off by approximately ${mae.toFixed(2)}. Lower is generally better.`;

  const rSquaredTooltipText = `R-squared (Coefficient of Determination) indicates how much of the variation in ${formattedTargetColumn} your model can explain. An R-squared of ${rSquared.toFixed(2)} (or ${(rSquared * 100).toFixed(1)}%) means the model explains about ${(rSquared * 100).toFixed(1)}% of the variance. Closer to 1 (or 100%) is generally better.`;

  const mseTooltipText = "Mean Squared Error (MSE) gives more weight to larger errors. It’s the average of the squared differences between actual and predicted values. Lower is better.";

  const rmseTooltipText = "Root Mean Squared Error (RMSE) is the square root of MSE. It tells you the typical distance between the predicted values and the actual values, in the same units as your target variable. Lower is better.";

  return (
    <Paper elevation={2} className="container" sx={{ padding: 3, marginTop: 3, maxWidth: '80%', marginX: 'auto' }}>
      <Typography variant="h2" component="h3" gutterBottom>
        4. Model Performance
      </Typography>

      {analysis && (
        <Box sx={{
          transform: 'translateY(-10px)',
          marginBottom: 4,
          padding: 2,
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: 'rgba(45, 55, 72, 0.9)',
          maxWidth: '60%',
          margin: '0 auto'
        }}>
          <Typography
            variant="h5"
            component="h4"
            gutterBottom
            sx={{ textAlign: 'center', color: 'secondary.main' }}
          >
            Overall Model Performance Grade
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', marginBottom: 1 }}>
            <Typography variant="h4" component="span" color="primary" sx={{ fontWeight: 'bold' }}>
              {analysis.overallGrade}
            </Typography>
            <Typography variant="h6" component="span" color="textSecondary" sx={{ marginLeft: 1 }}>
              ({analysis.overallScore}/100)
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', marginBottom: 2 }}>
            {analysis.interpretiveBlurb}
          </Typography>
        </Box>
      )}

      {/* ====================== Four Metric Boxes ====================== */}
      <Box sx={{
        marginBottom: 4,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
          md: 'repeat(auto-fit, minmax(200px, 1fr))'
        },
        gap: 4
      }}>
        {/* MAE Box */}
        <Box sx={{
          textAlign: 'center',
          padding: 1.5,
          border: '1px solid #eee',
          borderRadius: '4px',
          minWidth: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography variant="subtitle1">
            Mean Absolute Error (MAE)
            <Tooltip title={<Typography variant="body2">{maeTooltipText}</Typography>} placement="top" arrow>
              <HelpOutlineIcon fontSize="small" sx={{ verticalAlign: 'middle', marginLeft: 0.5, cursor: 'help' }} />
            </Tooltip>
          </Typography>
          <Typography variant="h5" color="primary" sx={{ marginTop: 0.5 }}>
            {mae.toFixed(3)}
          </Typography>
          <Typography variant="body2" sx={{ marginTop: 0.5 }}>
            Avg. prediction error for {formattedTargetColumn}
          </Typography>
        </Box>

        {/* R² Box */}
        <Box sx={{
          textAlign: 'center',
          padding: 1.5,
          border: '1px solid #eee',
          borderRadius: '4px',
          minWidth: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography variant="subtitle1">
            R-squared (R²)
            <Tooltip title={<Typography variant="body2">{rSquaredTooltipText}</Typography>} placement="top" arrow>
              <HelpOutlineIcon fontSize="small" sx={{ verticalAlign: 'middle', marginLeft: 0.5, cursor: 'help' }} />
            </Tooltip>
          </Typography>
          <Typography variant="h5" color="primary" sx={{ marginTop: 0.5 }}>
            {rSquared.toFixed(3)}
          </Typography>
          <Typography variant="body2" sx={{ marginTop: 0.5 }}>
            Model fit ({(rSquared * 100).toFixed(1)}%)
          </Typography>
        </Box>

        {/* MSE Box (conditionally shown) */}
        {typeof mse !== 'undefined' && (
          <Box sx={{
            textAlign: 'center',
            padding: 1.5,
            border: '1px solid #eee',
            borderRadius: '4px',
            minWidth: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography variant="subtitle1">
              Mean Squared Error (MSE)
              <Tooltip title={<Typography variant="body2">{mseTooltipText}</Typography>} placement="top" arrow>
                <HelpOutlineIcon fontSize="small" sx={{ verticalAlign: 'middle', marginLeft: 0.5, cursor: 'help' }} />
              </Tooltip>
            </Typography>
            <Typography variant="h5" color="primary" sx={{ marginTop: 0.5 }}>
              {mse.toFixed(3)}
            </Typography>
            <Typography variant="body2" sx={{ marginTop: 0.5 }}>
              Penalizes larger errors more
            </Typography>
          </Box>
        )}

        {/* RMSE Box (conditionally shown) */}
        {typeof rmse !== 'undefined' && (
          <Box sx={{
            textAlign: 'center',
            padding: 1.5,
            border: '1px solid #eee',
            borderRadius: '4px',
            minWidth: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography variant="subtitle1">
              Root Mean Sq. Error (RMSE)
              <Tooltip title={<Typography variant="body2">{rmseTooltipText}</Typography>} placement="top" arrow>
                <HelpOutlineIcon fontSize="small" sx={{ verticalAlign: 'middle', marginLeft: 0.5, cursor: 'help' }} />
              </Tooltip>
            </Typography>
            <Typography variant="h5" color="primary" sx={{ marginTop: 0.5 }}>
              {rmse.toFixed(3)}
            </Typography>
            <Typography variant="body2" sx={{ marginTop: 0.5 }}>
              Error in {formattedTargetColumn} units
            </Typography>
          </Box>
        )}
      </Box>

      {/* =================== Detailed Metric Analysis =================== */}
      {analysis && analysis.metricBreakdown && (
        <Box sx={{ marginTop: 4, padding: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
          <Typography variant="h5" component="h4" gutterBottom sx={{ color: 'secondary.main' }}>
            Detailed Metric Analysis
          </Typography>
          <List dense>
            {analysis.metricBreakdown.map((metric, index) => (
              <React.Fragment key={metric.metricName}>
                <ListItem sx={{ paddingLeft: 0, paddingRight: 0 }}>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'baseline',
                          flexWrap: 'wrap'
                        }}
                      >
                        <Typography
                          variant="body1"
                          component="span"
                          sx={{ fontWeight: 'bold', marginRight: 1 }}
                        >
                          {metric.metricName}:
                        </Typography>
                        <Typography
                          variant="body1"
                          component="span"
                          color="primary"
                          sx={{ marginRight: 2 }}
                        >
                          {metric.value}
                        </Typography>
                        {metric.scoreContribution && (
                          <Chip label={`Score: ${metric.scoreContribution}/100`} size="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ display: 'block', marginTop: 0.5 }}
                      >
                        {metric.interpretation}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < analysis.metricBreakdown.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* ================== Actual vs Predicted Scatter Plot ================== */}
      <Typography variant="h6" gutterBottom sx={{ marginTop: 4, textAlign: 'center' }}>
        Actual vs. Predicted {formattedTargetColumn}
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="actual"
            name={`Actual ${formattedTargetColumn}`}
            unit=""
            stroke="#B0B0B0"
            tick={{ fill: '#B0B0B0' }}
          >
            <Label
              value={`Actual ${formattedTargetColumn}`}
              offset={-30}
              position="insideBottom"
              style={{ fill: '#B0B0B0' }}
            />
          </XAxis>
          <YAxis
            type="number"
            dataKey="predicted"
            name={`Predicted ${formattedTargetColumn}`}
            unit=""
            stroke="#B0B0B0"
            tick={{ fill: '#B0B0B0' }}
          >
            <Label
              value={`Predicted ${formattedTargetColumn}`}
              angle={-90}
              offset={-20}
              position="insideLeft"
              style={{ textAnchor: 'middle', fill: '#B0B0B0' }}
            />
          </YAxis>
          <RechartsTooltip
            content={<CustomTooltipContent targetColumn={formattedTargetColumn} />}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#B0B0B0' }} />
          <Scatter name="Predictions" data={plotData} fill="#3498db" shape="circle" />
        </ScatterChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default ResultsComponent;
