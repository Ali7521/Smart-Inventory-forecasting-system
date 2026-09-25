const forecastingModel = require('./ml/forecastModelService');

function calculateDynamicSafetyStock({ dailyDemand, demandStandardDeviation, leadTimeDays, serviceLevelZ = 1.65 }) {
  const leadTime = Math.max(1, Number(leadTimeDays) || 1);
  const variabilityBuffer = (Number(serviceLevelZ) || 1.65) * demandStandardDeviation * Math.sqrt(leadTime);
  return Math.ceil(Math.max(0, variabilityBuffer));
}

async function createReplenishmentRecommendation(product, sales, options = {}) {
  const leadTimeDays = Math.max(1, Number(options.leadTimeDays ?? product.leadTimeDays) || 7);
  const inference = await forecastingModel.forecast({
    sales,
    horizonDays: options.horizonDays || leadTimeDays,
    method: options.method
  });
  const dynamicSafetyStock = calculateDynamicSafetyStock({
    dailyDemand: inference.dailyDemand,
    demandStandardDeviation: inference.demandStandardDeviation,
    leadTimeDays,
    serviceLevelZ: options.serviceLevelZ
  });
  const demandDuringLeadTime = Math.ceil(inference.dailyDemand * leadTimeDays);
  const reorderPoint = demandDuringLeadTime + dynamicSafetyStock;
  const recommendedOrderQuantity = Math.max(0, reorderPoint - product.currentStock);

  return {
    productId: product._id,
    productName: product.name,
    sku: product.sku,
    currentStock: product.currentStock,
    leadTimeDays,
    demandDuringLeadTime,
    dynamicSafetyStock,
    reorderPoint,
    recommendedOrderQuantity,
    status: product.currentStock <= reorderPoint ? 'REORDER' : 'HEALTHY',
    inference: {
      modelType: inference.modelType,
      dailyDemand: inference.dailyDemand,
      predictedDemand: inference.predictedDemand,
      confidence: inference.confidence
    }
  };
}

module.exports = { calculateDynamicSafetyStock, createReplenishmentRecommendation };
