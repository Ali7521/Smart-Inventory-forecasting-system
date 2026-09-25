const fs = require('fs');
const path = require('path');
const {
  calculateWMA,
  calculateLinearRegression,
  calculateConfidence
} = require('../forecastingEngine');
const { prepareForecastDataset } = require('../../utils/dataPipeline');

/**
 * Model boundary for inference. JSON artifacts can be exported by a training
 * job (for example an XGBoost/Prophet worker) and replaced without changing
 * API routes. Until an artifact is present, the deterministic WMA fallback
 * keeps the application operational.
 */
class ForecastModelService {
  constructor({ modelPath = process.env.FORECAST_MODEL_PATH } = {}) {
    this.modelPath = modelPath;
    this.model = null;
    this.loaded = false;
  }

  loadModel() {
    if (this.loaded) return this.model;
    this.loaded = true;

    if (!this.modelPath) return null;
    const resolvedPath = path.resolve(this.modelPath);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`Forecast model not found at ${resolvedPath}; using WMA fallback.`);
      return null;
    }

    try {
      this.model = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      return this.model;
    } catch (error) {
      console.warn(`Unable to load forecast model; using WMA fallback. ${error.message}`);
      return null;
    }
  }

  inferWithLinearArtifact(features, horizonDays) {
    const artifact = this.loadModel();
    if (!artifact || artifact.type !== 'linear-regression' || !artifact.coefficients) return null;

    const latest = features.at(-1);
    if (!latest) return null;
    const prediction = Object.entries(artifact.coefficients).reduce(
      (sum, [feature, coefficient]) => sum + (Number(coefficient) * (Number(latest[feature]) || 0)),
      Number(artifact.intercept) || 0
    );

    return {
      dailyDemand: Math.max(0, prediction),
      horizonDemand: Math.max(0, prediction * horizonDays),
      modelType: 'linear-regression-artifact'
    };
  }

  async forecast({ sales = [], horizonDays = 14, method = 'WMA' } = {}) {
    const safeHorizon = Math.max(1, Math.min(Number(horizonDays) || 14, 365));
    const { dailySales, features } = prepareForecastDataset(sales);
    const quantities = dailySales.map(({ quantity }) => quantity);
    const artifactPrediction = this.inferWithLinearArtifact(features, safeHorizon);

    let dailyDemand;
    let trendSlope = 0;
    let modelType = 'weighted-moving-average-fallback';

    if (artifactPrediction) {
      dailyDemand = artifactPrediction.dailyDemand;
      modelType = artifactPrediction.modelType;
    } else if (method === 'LinearRegression') {
      const trend = calculateLinearRegression(quantities);
      dailyDemand = trend.avgDailyDemand;
      trendSlope = trend.slope;
      modelType = 'linear-regression-fallback';
    } else {
      dailyDemand = calculateWMA(quantities, 14);
    }

    const confidence = calculateConfidence(quantities);
    const standardDeviation = quantities.length
      ? Math.sqrt(quantities.reduce((sum, value) => sum + ((value - dailyDemand) ** 2), 0) / quantities.length)
      : 0;

    return {
      horizonDays: safeHorizon,
      modelType,
      dailyDemand: Number(dailyDemand.toFixed(2)),
      predictedDemand: Math.ceil(Math.max(0, dailyDemand * safeHorizon)),
      demandStandardDeviation: Number(standardDeviation.toFixed(2)),
      trendSlope,
      confidence,
      dailySales,
      features
    };
  }
}

module.exports = new ForecastModelService();
module.exports.ForecastModelService = ForecastModelService;
