import styles from './App.module.css'
import { DateTime } from 'luxon'
import { getSunPositionSeries, type SunPosition } from './domain/sunTimes'
import type { ChartPoint, CityEntry, PhotonFeature, WindowSize } from './viz/lib/types';
import { toChartPoints } from './viz/lib/scale';
import DayLengthChart from './viz/DayLengthChart';
import { useEffect, useState } from 'react';
import { generateAltitudeTicks, generateTimeTicks } from './viz/lib/ticks';
import { randomColor } from './viz/lib/color';
import { CHART_MARGIN, CHART_PANEL_INSET, CONTENT_MAX_WIDTH } from './config/chart';
import "react-datepicker/dist/react-datepicker.css";
import ControlPanel from './ui/ControlPanel';



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
    if (role === 'primary') {
      setCities(prev => ({primary: prev.secondary, secondary: null}))
    } else {
      setCities(prev => ({ ...prev, [role]: null }))
    }
    
  }

  const [windowSize, setWindowSize] = useState<WindowSize>({ width: Math.min(window.innerWidth, CONTENT_MAX_WIDTH), height: window.innerHeight * 0.8 });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function handleResize() {
      timeout = setTimeout(() => {
        setWindowSize({ width: Math.min(window.innerWidth, CONTENT_MAX_WIDTH), height: window.innerHeight * 0.8 })
      }, 300)
    }
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    }
  }, [windowSize]);

  const chartWidth = windowSize.width - CHART_PANEL_INSET;
  const chartHeight = windowSize.height * 0.7;
  const innerWidth = chartWidth - CHART_MARGIN.left - CHART_MARGIN.right;
  const innerHeight = chartHeight - CHART_MARGIN.top - CHART_MARGIN.bottom;

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
    <div className={styles.page}>
      <ControlPanel
        cities={cities}
        selectedDate={selectedDate}
        onCitySelect={handleCitySelect}
        onCityRemove={handleCityRemove}
        onDateChange={handleChange}
      />
      <DayLengthChart
      charts={charts}
      xTicks={xTicks}
      yTicks={yTicks}
      width={chartWidth}
      height={chartHeight}
      margin={CHART_MARGIN} />
    </div>
  )
}

export default App
