import './App.css'
import { DateTime } from 'luxon'
import { getSunPositionSeries, type SunPosition } from './domain/sunTimes'
import type { ChartPoint } from './viz/types';
import { toChartPoints } from './viz/scale';
import DayLengthChart from './viz/DayLengthChart';

import { generateAltitudeTicks, generateTimeTicks } from './viz/ticks';

function App() {
  const lat1: number = 44.816245;
  const lon1: number = 20.460469;
  const lat2: number = 84.519326;
  const lon2: number = 96.494815;
  const width: number = 800;
  const height: number = 600;

  const margin = { top: 20, right: 50, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const sunTimes1: SunPosition[] = getSunPositionSeries(DateTime.now(), lat1, lon1, 5);
  const sunTimes2: SunPosition[] = getSunPositionSeries(DateTime.now(), lat2, lon2, 5);
  const chartPoints1: ChartPoint[] = toChartPoints(sunTimes1, innerWidth, innerHeight);
  const chartPoints2: ChartPoint[] = toChartPoints(sunTimes2, innerWidth, innerHeight);
  const chart1 = {points: chartPoints1, stroke: 'black'};
  const chart2 = {points: chartPoints2, stroke: 'red'};
  const charts = [chart1, chart2];

  const xTicks = generateTimeTicks(DateTime.now(), innerWidth, 1, 3);
  const yTicks = generateAltitudeTicks(innerHeight, 5, 2);

  return (
    <>
      <DayLengthChart charts={charts} xTicks={xTicks} yTicks={yTicks} width={width} height={height} margin={margin}/>
    </>
  )
}

export default App
