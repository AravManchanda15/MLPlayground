export const analyzeModelPerformance = (metrics, targetStats, targetColumnName) => {
  const { mae, rSquared, mse, rmse } = metrics;
  const { targetMean, targetRange } = targetStats;

  // Metric Interpretation Rules
  let rSquaredInterpretation = "";
  if (rSquared > 0.8) {
    rSquaredInterpretation = "Excellent";
  } else if (rSquared >= 0.6) {
    rSquaredInterpretation = "Good";
  } else if (rSquared >= 0.4) {
    rSquaredInterpretation = "Fair";
  } else {
    rSquaredInterpretation = "Needs Improvement";
  }

  const rmsePercentageOfMean = targetMean !== 0 ? (rmse / targetMean) * 100 : Infinity;
  let rmseInterpretation = "";
  if (rmsePercentageOfMean < 10) {
    rmseInterpretation = "Excellent";
  } else if (rmsePercentageOfMean < 20) {
    rmseInterpretation = "Good";
  } else if (rmsePercentageOfMean < 35) {
    rmseInterpretation = "Fair";
  } else {
    rmseInterpretation = "Needs Improvement";
  }

  const maePercentageOfMean = targetMean !== 0 ? (mae / targetMean) * 100 : Infinity;
  let maeInterpretation = "";
  if (maePercentageOfMean < 10) {
    maeInterpretation = "Excellent";
  } else if (maePercentageOfMean < 20) {
    maeInterpretation = "Good";
  } else if (maePercentageOfMean < 35) {
    maeInterpretation = "Fair";
  } else {
    maeInterpretation = "Needs Improvement";
  }
  
  // Overall Score/Grade Algorithm
  const rSquaredScoreComponent = Math.max(0, rSquared) * 100;
  // Handle cases where targetMean is 0 to avoid division by zero, leading to NaN for scores
  const rmseScoreComponent = targetMean !== 0 ? Math.max(0, 100 - rmsePercentageOfMean) : 0; // Score 0 if targetMean is 0
  const maeScoreComponent = targetMean !== 0 ? Math.max(0, 100 - maePercentageOfMean) : 0; // Score 0 if targetMean is 0

  const overallScore =
    0.5 * rSquaredScoreComponent +
    0.3 * rmseScoreComponent +
    0.2 * maeScoreComponent;

  let overallGrade = "";
  if (overallScore >= 90) {
    overallGrade = "A";
  } else if (overallScore >= 80) {
    overallGrade = "B";
  } else if (overallScore >= 70) {
    overallGrade = "C";
  } else if (overallScore >= 60) {
    overallGrade = "D";
  } else {
    overallGrade = "F";
  }

  // Interpretive Blurb
  let interpretiveBlurb = "";
  switch (overallGrade) {
    case "A":
      interpretiveBlurb = `This model demonstrates an excellent ability to predict ${targetColumnName}. It effectively captures the underlying patterns in the data.`;
      break;
    case "B":
      interpretiveBlurb = `This model shows a good ability to predict ${targetColumnName}. While there\'s room for improvement, it captures a significant portion of the data\'s patterns.`;
      break;
    case "C":
      interpretiveBlurb = `This model has a fair ability to predict ${targetColumnName}. It captures some patterns but struggles with others. Consider reviewing features or model complexity.`;
      break;
    case "D":
      interpretiveBlurb = `This model\'s ability to predict ${targetColumnName} is limited. It likely misses key patterns in the data. Significant improvements are needed.`;
      break;
    case "F":
    default:
      interpretiveBlurb = `This model struggles significantly to predict ${targetColumnName}. It does not appear to capture meaningful patterns in the data. Revisit feature selection and model choice.`;
      break;
  }

  // Metric Breakdown
  const metricBreakdown = [
    {
      metricName: "R-squared",
      value: rSquared.toFixed(2),
      interpretation: `${rSquaredInterpretation}: Explains ${(rSquared * 100).toFixed(0)}% of the variance in ${targetColumnName}.`,
      scoreContribution: rSquaredScoreComponent.toFixed(0),
    },
    {
      metricName: "Root Mean Squared Error (RMSE)",
      value: rmse.toFixed(2),
      interpretation: `${rmseInterpretation}: Average prediction error is ${rmse.toFixed(2)} units. This is ${targetMean !== 0 ? rmsePercentageOfMean.toFixed(1) + '% of the average ' + targetColumnName + ' value (' + targetMean.toFixed(2) + ')' : 'N/A (average target value is 0)'}.`,
      scoreContribution: rmseScoreComponent.toFixed(0),
    },
    {
      metricName: "Mean Absolute Error (MAE)",
      value: mae.toFixed(2),
      interpretation: `${maeInterpretation}: Average absolute prediction error is ${mae.toFixed(2)} units. This is ${targetMean !== 0 ? maePercentageOfMean.toFixed(1) + '% of the average ' + targetColumnName + ' value (' + targetMean.toFixed(2) + ')' : 'N/A (average target value is 0)'}.`,
      scoreContribution: maeScoreComponent.toFixed(0),
    },
    {
      metricName: "Mean Squared Error (MSE)",
      value: mse.toFixed(2),
      interpretation: "Used to calculate RMSE; penalizes larger errors more. Lower is generally better.",
    },
  ];
  
  // Add target range information if available
  if (targetRange && targetRange !== 0) {
    const rmsePercentageOfRange = (rmse / targetRange) * 100;
    const maePercentageOfRange = (mae / targetRange) * 100;
    
    metricBreakdown[1].interpretation += ` It\'s also ${rmsePercentageOfRange.toFixed(1)}% of the total range of ${targetColumnName} (${targetRange.toFixed(2)}).`;
    metricBreakdown[2].interpretation += ` It\'s also ${maePercentageOfRange.toFixed(1)}% of the total range of ${targetColumnName} (${targetRange.toFixed(2)}).`;
  
  } else if (targetRange === 0) {
    metricBreakdown[1].interpretation += ` The total range of ${targetColumnName} is 0.`
    metricBreakdown[2].interpretation += ` The total range of ${targetColumnName} is 0.`
  }


  return {
    overallScore: overallScore.toFixed(0),
    overallGrade,
    interpretiveBlurb,
    metricBreakdown,
  };
}; 