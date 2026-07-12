import './App.css'
import { DateTime } from 'luxon'
import { getSunPositionSeries, type SunPosition } from './domain/sunTimes'
import type { ChartPoint } from './viz/types';
import { toChartPoints } from './viz/scale';
import DayLengthChart from './viz/DayLengthChart';
import CityAutocomplete, { type PhotonFeature } from './viz/CityAutocomplete';
import { useState } from 'react';
import { generateAltitudeTicks, generateTimeTicks } from './viz/ticks';
import { randomColor } from './viz/color';
import { CHART_HEIGTH, CHART_MARGIN, CHART_WIDTH } from './config/chart';

interface CityEntry {
  feature: PhotonFeature
  color: string
}

function App() {
  const [cities, setCities] = useState<CityEntry[]>([])

  function handleCitySelect(feature: PhotonFeature) {
    setCities([...cities, { feature: feature, color: randomColor() }]);
  }

  const innerWidth = CHART_WIDTH - CHART_MARGIN.left - CHART_MARGIN.right;
  const innerHeight = CHART_HEIGTH - CHART_MARGIN.top - CHART_MARGIN.bottom;

  const charts: { points: ChartPoint[], stroke: string }[] = [];

  const xTicks = generateTimeTicks(DateTime.now(), innerWidth, 1, 3);
  const yTicks = generateAltitudeTicks(innerHeight, 5, 2);

  cities.map((city) => {
    const sunTimes: SunPosition[] = getSunPositionSeries(DateTime.now(), city.feature.geometry.coordinates[1], city.feature.geometry.coordinates[0], 5);
    const chartPoints: ChartPoint[] = toChartPoints(sunTimes, innerWidth, innerHeight);
    charts.push({ points: chartPoints, stroke: city.color })
  })

  return (
    <>
      <CityAutocomplete onSelect={handleCitySelect} />
      <DayLengthChart charts={charts} xTicks={xTicks} yTicks={yTicks} width={CHART_WIDTH} height={CHART_HEIGTH} margin={CHART_MARGIN} />
    </>
  )
}

export default App
