/**
 * Utilities that turn raw sales events into a reliable daily time series for
 * model inference. They are deliberately framework-independent so a future
 * training worker can reuse the same transformations.
 */

function toUtcDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function cleanSalesRecords(records = []) {
  if (!Array.isArray(records)) return [];

  return records
    .map((record) => ({
      date: toUtcDateKey(record.date),
      quantity: Number(record.quantity)
    }))
    .filter((record) => record.date && Number.isFinite(record.quantity) && record.quantity >= 0);
}

function aggregateDailySales(records = []) {
  const totals = new Map();
  cleanSalesRecords(records).forEach(({ date, quantity }) => {
    totals.set(date, (totals.get(date) || 0) + quantity);
  });

  return [...totals.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, quantity]) => ({ date, quantity }));
}

function fillMissingDays(dailySales = [], endDate = new Date()) {
  const aggregated = aggregateDailySales(dailySales);
  if (!aggregated.length) return [];

  const quantitiesByDate = new Map(aggregated.map(({ date, quantity }) => [date, quantity]));
  const current = new Date(`${aggregated[0].date}T00:00:00.000Z`);
  const end = new Date(endDate);
  const series = [];

  while (current <= end) {
    const date = current.toISOString().slice(0, 10);
    series.push({ date, quantity: quantitiesByDate.get(date) || 0 });
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return series;
}

function buildForecastFeatures(dailySales = []) {
  return dailySales.map((point, index, series) => {
    const date = new Date(`${point.date}T00:00:00.000Z`);
    const trailingWeek = series.slice(Math.max(0, index - 6), index + 1);
    const weekAverage = trailingWeek.reduce((sum, item) => sum + item.quantity, 0) / trailingWeek.length;

    return {
      date: point.date,
      quantity: point.quantity,
      dayOfWeek: date.getUTCDay(),
      month: date.getUTCMonth() + 1,
      isWeekend: [0, 6].includes(date.getUTCDay()) ? 1 : 0,
      lag1: index > 0 ? series[index - 1].quantity : 0,
      lag7: index > 6 ? series[index - 7].quantity : 0,
      rolling7DayAverage: Number(weekAverage.toFixed(3))
    };
  });
}

function prepareForecastDataset(records, endDate) {
  const dailySales = fillMissingDays(records, endDate);
  return { dailySales, features: buildForecastFeatures(dailySales) };
}

module.exports = {
  cleanSalesRecords,
  aggregateDailySales,
  fillMissingDays,
  buildForecastFeatures,
  prepareForecastDataset
};
