import './App.css'
import { DateTime } from 'luxon'
import { getSunPositionSeries, type SunPosition } from './domain/sunTimes'
import type { ChartPoint, CityEntry, PhotonFeature, WindowSize } from './viz/lib/types';
import { toChartPoints } from './viz/lib/scale';
import DayLengthChart from './viz/DayLengthChart';
import { useEffect, useState } from 'react';
import { generateAltitudeTicks, generateTimeTicks } from './viz/lib/ticks';
import { randomColor } from './viz/lib/color';
import { CHART_MARGIN } from './config/chart';
import Datepicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LocationCard from './ui/LocationCard';



function App() {
  const [cities, setCities] = useState<{ primary: CityEntry | null, secondary: CityEntry | null }>({ primary: null, secondary: null })

  function handleCitySelect(role: 'primary' | 'secondary', feature: PhotonFeature) {
    setCities(prev => ({ ...prev, [role]: { feature, color: randomColor() } }))
  }

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleChange = (date: Date | null) => {
    if (date === null) {
      return
    }
    setSelectedDate(date);
  };

  function handleCityRemove(role: 'primary' | 'secondary') {
    setCities(prev => ({ ...prev, [role]: null }))
  }

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

  [cities.primary, cities.secondary]
    .filter((city): city is CityEntry => city !== null)
    .forEach((city) => {
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
        <Datepicker selected={selectedDate} dateFormat={"dd.MM.yyyy"} shouldCloseOnSelect={false} calendarStartDay={1} popperPlacement="bottom-start" onChange={handleChange} />
      </div>
      <DayLengthChart charts={charts} xTicks={xTicks} yTicks={yTicks} width={windowSize.width} height={windowSize.height} margin={CHART_MARGIN} />
      <LocationCard role={'primary'} city={cities.primary} date={DateTime.fromJSDate(selectedDate)} onSelect={(feature) => handleCitySelect('primary', feature)} />
      <LocationCard role={'secondary'} city={cities.secondary} date={DateTime.fromJSDate(selectedDate)} onSelect={(feature) => handleCitySelect('secondary', feature)} onRemove={() => handleCityRemove('secondary')} />
    </>
  )
}

export default App
