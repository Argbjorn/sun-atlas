import './App.css'
import { DateTime } from 'luxon'
import { getSunPositionSeries, type SunPosition } from './domain/sunTimes'
import type { ChartPoint, WindowSize } from './viz/lib/types';
import { toChartPoints } from './viz/lib/scale';
import DayLengthChart from './viz/DayLengthChart';
import CityAutocomplete, { type PhotonFeature } from './ui/CityAutocomplete';
import { useEffect, useState } from 'react';
import { generateAltitudeTicks, generateTimeTicks } from './viz/lib/ticks';
import { randomColor } from './viz/lib/color';
import { CHART_MARGIN } from './config/chart';
import InfoPanel from './ui/InfoPanel';
import Datepicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export interface CityEntry {
  feature: PhotonFeature
  color: string
}

function App() {
  const [cities, setCities] = useState<CityEntry[]>([])

  function handleCitySelect(feature: PhotonFeature) {
    setCities([...cities, { feature: feature, color: randomColor() }]);
  }

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleChange = (date: Date | null) => {
    if (date === null) {
      return
    }
    setSelectedDate(date);
  };

  const [windowSize, setWindowSize] = useState<WindowSize>({ width: window.innerWidth * 0.9, height: window.innerHeight * 0.8 });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function handleResize() {
      timeout = setTimeout(() => {
        setWindowSize({ width: window.innerWidth * 0.9, height: window.innerHeight * 0.8 })
      }, 300)
    }
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    }
  }, [windowSize]);

  const innerWidth = windowSize.width - CHART_MARGIN.left - CHART_MARGIN.right;
  const innerHeight = windowSize.height - CHART_MARGIN.top - CHART_MARGIN.bottom;

  const charts: { points: ChartPoint[], stroke: string }[] = [];

  const xTicks = generateTimeTicks(DateTime.fromJSDate(selectedDate), innerWidth, 1, 1);
  const yTicks = generateAltitudeTicks(innerHeight, 5, 2);

  cities.map((city) => {
    const sunTimes: SunPosition[][] = getSunPositionSeries(DateTime.fromJSDate(selectedDate), city.feature.geometry.coordinates[1], city.feature.geometry.coordinates[0], 5);
    let chartPoints: ChartPoint[] = [];
    sunTimes.forEach(segment => {
      chartPoints = toChartPoints(segment, innerWidth, innerHeight);
      charts.push({ points: chartPoints, stroke: city.color })
    });
  })

  return (
    <>
      <div>
        <CityAutocomplete onSelect={handleCitySelect} />
        <Datepicker selected={selectedDate} dateFormat={"dd.MM.yyyy"} shouldCloseOnSelect={false} calendarStartDay={1} popperPlacement="bottom-start" onChange={handleChange} />
      </div>
      <DayLengthChart charts={charts} xTicks={xTicks} yTicks={yTicks} width={windowSize.width} height={windowSize.height} margin={CHART_MARGIN} />
      <InfoPanel width={windowSize.width} date={DateTime.fromJSDate(selectedDate)} cities={cities} />
    </>
  )
}

export default App
