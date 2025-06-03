# ML Playground

This is an educational web application to introduce non-technical users to basic machine learning concepts.

## Project Goal

The purpose of this application is to allow users to:
1.  Load or upload tabular data (CSV files).
2.  Select a column to predict (target variable) and columns to use for prediction (features).
3.  Choose a simple model type.
4.  Train the model in the browser using TensorFlow.js.
5.  View model performance metrics (e.g., Mean Absolute Error, R-squared) and visualizations.
6.  Make live predictions using the trained model.

Everything runs in the browser; no backend is required.

## Tech Stack

*   **Framework:** React.js
*   **CSV Parsing:** Papa Parse
*   **Machine Learning:** TensorFlow.js
*   **Charting/Visualization:** Recharts
*   **Styling:** Material-UI (for some components) and basic CSS

## Getting Started

### Prerequisites

*   Node.js and npm (or yarn) installed.

### Installation & Running the App

1.  **Clone the repository (or download the files).**

2.  **Navigate to the project directory:**
    ```bash
    cd ml-playground
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    # OR
    # yarn install
    ```

4.  **Place sample CSV files:**
    Ensure the following sample CSV files are in the `public/` directory:
    *   `sample1.csv` (Car MPG)
    *   `sample2.csv` (Medical Costs)
    *   `sample3.csv` (California Housing)

5.  **Start the development server:**
    ```bash
    npm start
    # OR
    # yarn start
    ```
    This will open the application in your default web browser, usually at `http://localhost:3000`.

## Application Structure

*   `public/`: Contains static assets, including sample CSVs.
*   `src/`: Contains the React application code.
    *   `App.js`: The main application component, manages state and workflow.
    *   `App.css`: Global styles for the application.
    *   `index.js`: Entry point for the React app.
    *   `components/`:
        *   `DataSourceComponent.js`: Handles data input (sample datasets and CSV uploads).
        *   `ModelConfigurationComponent.js`: Allows users to configure model parameters.
        *   `TrainingComponent.js`: Manages the model training process.
        *   `ResultsComponent.js`: Displays model performance metrics and visualizations.
        *   `PredictionComponent.js`: Allows users to make predictions with the trained model.

## Core Philosophy

*   **Simplicity First:** Designed for absolute beginners.
*   **No Back-End:** Runs entirely in the user's browser.
*   **Educational Focus:** Guides the user through a logical workflow, explaining each step. 