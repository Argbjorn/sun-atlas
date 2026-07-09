import './App.css'
import { DateTime } from 'luxon'
import { getSunPositionSeries, type SunPosition } from './domain/sunTimes'
import type { ChartPoint } from './viz/DayLengthChart';
import { toChartPoints } from './viz/scale';
import DayLengthChart from './viz/DayLengthChart';

function App() {
  const lat: number = 44.816245;
  const lon: number = 20.460469;
  const width: number = 800;
  const height: number = 600;

  const sunTimes: SunPosition[] = getSunPositionSeries(DateTime.now(), lat, lon, 5);
  const chartPoints: ChartPoint[] = toChartPoints(sunTimes, width, height)
  console.log(chartPoints)

  return (
    <>
      <DayLengthChart points={chartPoints} width={width} height={height} />
    </>
  )
}

export default App
