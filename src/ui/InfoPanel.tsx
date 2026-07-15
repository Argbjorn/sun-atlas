import { DateTime } from "luxon"
import * as SunCalc from 'suncalc'
import tzLookup from '@photostructure/tz-lookup';
import type { CityEntry } from "../App";

interface InfoPanelProps {
    width: number
    date: DateTime
    cities: CityEntry[]
}

interface cityInfo {
    name: string
    sunrise: string
    sunset: string
}

function InfoPanel({width, date, cities}: InfoPanelProps) {
    const citiesInfo: cityInfo[] = [];
    cities.forEach(city => {
        const lat = city.feature.geometry.coordinates[1];
        const lon = city.feature.geometry.coordinates[0];
        const timeZone = tzLookup(lat, lon)
        const sunTimes = SunCalc.getTimes(date.toJSDate(), lat, lon)
        const sunrise = sunTimes.sunrise ? DateTime.fromJSDate(sunTimes.sunrise).setZone(timeZone).toFormat('HH:mm') : 'no data'
        const sunset = sunTimes.sunset ? DateTime.fromJSDate(sunTimes.sunset).setZone(timeZone).toFormat('HH:mm') : 'no data'
        citiesInfo.push({name: city.feature.properties.name,
            sunrise: sunrise,
            sunset: sunset
        })
    })
    return (
        <div style={{width: `${width}px`, border: '1px solid #ccc'}}>
            {citiesInfo.map(city => (
                <div key={city.name}>
                <p>{city.name}</p>
                <p>sunrise: {city.sunrise}</p>
                <p>sunset: {city.sunset}</p>
                </div>
            ))}
        </div>
    )
}

export default InfoPanel