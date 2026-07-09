import './App.css'
import { DateTime } from 'luxon'
import { getSunPositionSeries, type SunPosition } from './domain/sunTimes'
import type { ChartPoint } from './viz/DayLengthChart';
import { toChartPoints } from './viz/scale';
import DayLengthChart from './viz/DayLengthChart';

function App() {
  const lat1: number = 44.816245;
  const lon1: number = 20.460469;
  const lat2: number = 59.938784;
  const lon2: number = 30.314997;
  const width: number = 800;
  const height: number = 600;

  const sunTimes1: SunPosition[] = getSunPositionSeries(DateTime.now(), lat1, lon1, 5);
  const sunTimes2: SunPosition[] = getSunPositionSeries(DateTime.now(), lat2, lon2, 5);
  const chartPoints1: ChartPoint[] = toChartPoints(sunTimes1, width, height)
  const chartPoints2: ChartPoint[] = toChartPoints(sunTimes2, width, height)
  const chart1 = {points: chartPoints1, stroke: 'black'}
  const chart2 = {points: chartPoints2, stroke: 'red'}
  const charts = [chart1, chart2]

  return (
    <>
      <DayLengthChart charts={charts} width={width} height={height} />
    </>
  )
}

export default App
