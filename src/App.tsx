import './App.css'
import { DateTime } from 'luxon'
import { getSunPositionSeries, type SunPosition } from './domain/sunTimes'
import type { ChartPoint } from './viz/lib/types';
import { toChartPoints } from './viz/lib/scale';
import DayLengthChart from './viz/DayLengthChart';
import CityAutocomplete, { type PhotonFeature } from './ui/CityAutocomplete';
import { useState } from 'react';
import { generateAltitudeTicks, generateTimeTicks } from './viz/lib/ticks';
import { randomColor } from './viz/lib/color';
import { CHART_HEIGTH, CHART_MARGIN, CHART_WIDTH } from './config/chart';
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

  const innerWidth = CHART_WIDTH - CHART_MARGIN.left - CHART_MARGIN.right;
  const innerHeight = CHART_HEIGTH - CHART_MARGIN.top - CHART_MARGIN.bottom;

  const charts: { points: ChartPoint[], stroke: string }[] = [];

  const xTicks = generateTimeTicks(DateTime.fromJSDate(selectedDate), innerWidth, 1, 3);
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
      <DayLengthChart charts={charts} xTicks={xTicks} yTicks={yTicks} width={CHART_WIDTH} height={CHART_HEIGTH} margin={CHART_MARGIN} />
      <InfoPanel width={CHART_WIDTH} date={DateTime.fromJSDate(selectedDate)} cities={cities} />
    </>
  )
}

export default App
