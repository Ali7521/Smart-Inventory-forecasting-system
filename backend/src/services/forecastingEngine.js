const Sale = require('../models/Sale');
const Product = require('../models/Product');

/**
 * Aggregates sales records for a product into daily total quantities.
 * Fills missing days with 0 sales for a continuous time-series.
 */
async function getDailySalesSeries(productId, daysBack = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const sales = await Sale.find({
    productId,
    date: { $gte: cutoffDate }
  }).sort({ date: 1 });

  // Map sales by YYYY-MM-DD string
  const salesByDate = {};
  sales.forEach(sale => {
    const dStr = new Date(sale.date).toISOString().split('T')[0];
    salesByDate[dStr] = (salesByDate[dStr] || 0) + sale.quantity;
  });

  // Create continuous daily array from cutoffDate to today
  const dailySeries = [];
  const curr = new Date(cutoffDate);
  const today = new Date();

  while (curr <= today) {
    const dStr = curr.toISOString().split('T')[0];
    dailySeries.push({
      date: dStr,
      quantity: salesByDate[dStr] || 0
    });
    curr.setDate(curr.getDate() + 1);
  }

  return dailySeries;
}

/**
 * Calculates Simple Moving Average (SMA)
 */
function calculateSMA(quantities, windowSize) {
  if (quantities.length === 0) return 0;
  const recent = quantities.slice(-windowSize);
  const sum = recent.reduce((acc, val) => acc + val, 0);
  return sum / recent.length;
}

/**
 * Calculates Weighted Moving Average (WMA) with linear weights
 */
function calculateWMA(quantities, windowSize) {
  if (quantities.length === 0) return 0;
  const recent = quantities.slice(-windowSize);
  const n = recent.length;
  
  let weightedSum = 0;
  let weightTotal = 0;

  for (let i = 0; i < n; i++) {
    const weight = i + 1; // 1, 2, ..., n (most recent gets highest weight)
    weightedSum += recent[i] * weight;
    weightTotal += weight;
  }

  return weightTotal > 0 ? weightedSum / weightTotal : 0;
}

/**
 * Calculates Linear Regression Trend (y = mx + b)
 */
function calculateLinearRegression(quantities) {
  const n = quantities.length;
  if (n < 2) return { avgDailyDemand: quantities[0] || 0, slope: 0, intercept: quantities[0] || 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let x = 0; x < n; x++) {
    const y = quantities[x];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = (n * sumXX) - (sumX * sumX);
  const slope = denominator !== 0 ? ((n * sumXY) - (sumX * sumY)) / denominator : 0;
  const intercept = (sumY - (slope * sumX)) / n;

  // Project next day demand based on slope and intercept
  const nextDayProjection = Math.max(0, slope * n + intercept);
  
  return {
    avgDailyDemand: nextDayProjection,
    slope: parseFloat(slope.toFixed(4)),
    intercept: parseFloat(intercept.toFixed(4))
  };
}

/**
 * Calculates confidence score & label based on sales variance
 */
function calculateConfidence(quantities) {
  const n = quantities.length;
  const nonZeroDays = quantities.filter(q => q > 0).length;

  if (n < 7 || nonZeroDays < 3) {
    return { confidenceScore: 30, confidenceLabel: 'Insufficient Data' };
  }

  const mean = quantities.reduce((a, b) => a + b, 0) / n;
  if (mean === 0) {
    return { confidenceScore: 50, confidenceLabel: 'Low' };
  }

  const variance = quantities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean; // Coefficient of Variation

  // Lower CV means stable predictable demand -> Higher confidence score
  let score = Math.max(10, Math.min(98, Math.round((1 - Math.min(cv, 1)) * 100)));
  
  let label = 'Low';
  if (score >= 75) label = 'High';
  else if (score >= 50) label = 'Medium';

  return { confidenceScore: score, confidenceLabel: label };
}

/**
 * Main Forecasting Function for a product
 */
async function generateProductForecast(productId, periodDays = 14, method = 'WMA') {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const dailySeries = await getDailySalesSeries(productId, 60);
  const quantities = dailySeries.map(s => s.quantity);

  let dailyDemandRate = 0;
  let trendSlope = 0;

  if (method === 'SMA') {
    dailyDemandRate = calculateSMA(quantities, 14);
  } else if (method === 'LinearRegression') {
    const lrResult = calculateLinearRegression(quantities);
    dailyDemandRate = lrResult.avgDailyDemand;
    trendSlope = lrResult.slope;
  } else {
    // Default WMA
    dailyDemandRate = calculateWMA(quantities, 14);
  }

  const predictedDemand = Math.max(0, Math.ceil(dailyDemandRate * periodDays));
  const safetyStock = product.safetyStock || 5;
  const currentStock = product.currentStock || 0;

  // Suggested reorder = Demand during period + Safety Stock - Current Stock
  const suggestedReorderQty = Math.max(0, Math.ceil(predictedDemand + safetyStock - currentStock));

  const { confidenceScore, confidenceLabel } = calculateConfidence(quantities);

  return {
    productId: product._id,
    productName: product.name,
    sku: product.sku,
    category: product.category,
    currentStock,
    unitCost: product.unitCost,
    reorderThreshold: product.reorderThreshold,
    safetyStock,
    periodDays,
    method,
    dailyDemandRate: parseFloat(dailyDemandRate.toFixed(2)),
    predictedDemand,
    suggestedReorderQty,
    confidenceScore,
    confidenceLabel,
    trendSlope,
    dailySeries
  };
}

module.exports = {
  getDailySalesSeries,
  calculateSMA,
  calculateWMA,
  calculateLinearRegression,
  calculateConfidence,
  generateProductForecast
};
