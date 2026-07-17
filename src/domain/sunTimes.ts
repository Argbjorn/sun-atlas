import { DateTime, Duration } from 'luxon';
import * as SunCalc from 'suncalc'
import tzLookup from '@photostructure/tz-lookup';

export interface SunPosition {
    time: DateTime
    altitudeDeg: number
}

export function getSunPositionSeries(date: DateTime, lat: number, lon: number, stepMinutes: number): SunPosition[][] {
    const sunPositionSeries: SunPosition[][] = [];
    const sunIntervals = getSunIntervals(date, lat, lon);
    sunIntervals.forEach(sunInterval => {
        const sunPositionRange: SunPosition[] = []
        for (let time = sunInterval.start; time < sunInterval.end; time = time.plus({ minutes: stepMinutes })) {
            sunPositionRange.push({ time: time, altitudeDeg: SunCalc.getPosition(time.toJSDate(), lat, lon).altitude });
        };
        sunPositionRange.push({ time: sunInterval.end, altitudeDeg: SunCalc.getPosition(sunInterval.end.toJSDate(), lat, lon).altitude })
        sunPositionSeries.push(sunPositionRange);
    })
    return sunPositionSeries;
}

export function getSunSummary(date: DateTime, lat: number, lon: number): {sunrise: DateTime | null, sunset: DateTime | null, solarNoonTime: DateTime | null, solarNoonDeg: number | null, dayLength: Duration | null } {
    const timeZone = tzLookup(lat, lon);
    const sunTimes = SunCalc.getTimes(date.toJSDate(), lat, lon);
    const sunrise = toZoned(sunTimes.sunrise, timeZone);
    const sunset = toZoned(sunTimes.sunset, timeZone);
    const solarNoonTime = toZoned(sunTimes.solarNoon, timeZone);
    const solarNoonDeg = solarNoonTime ? SunCalc.getPosition(solarNoonTime.toJSDate(), lat, lon).altitude : null;
    const polarDay = isPolarDay(solarNoonTime, lat, lon);
    const dayLength = getDayLength(sunrise, sunset, polarDay);

    return {
        sunrise: sunrise,
        sunset: sunset,
        solarNoonTime: solarNoonTime,
        solarNoonDeg: solarNoonDeg,
        dayLength: dayLength
    }
}

function getDayLength(sunrise: DateTime | null, sunset: DateTime | null, isPolarDay: boolean): Duration | null {
    if (sunrise && sunset) {
        return sunset.diff(sunrise)
    }
    return isPolarDay ? Duration.fromObject({ hours: 24 }) : Duration.fromObject({ hours: 0 })
}

function isPolarDay(solarNoon: DateTime | null, lat: number, lon: number): boolean {
    if (solarNoon) {
        const solarNoonAltitude = SunCalc.getPosition(solarNoon.toJSDate(), lat, lon).altitude;
        return solarNoonAltitude > 0
    }
    return false
    
    
}

function getSunIntervals(date: DateTime, lat: number, lon: number): { start: DateTime, end: DateTime }[] {
    const timeZone = tzLookup(lat, lon);
    const sunTimes = SunCalc.getTimes(date.toJSDate(), lat, lon);
    const sunTimesDayBefore = SunCalc.getTimes(date.minus({ days: 1 }).toJSDate(), lat, lon);

    const sunrise = toZoned(sunTimes.sunrise, timeZone);
    const sunset = toZoned(sunTimes.sunset, timeZone);
    const sunsetDayBefore = toZoned(sunTimesDayBefore.sunset, timeZone);

    if (sunrise === null) {
        if (sunset === null) {
            if (isPolarDay(toZoned(sunTimes.solarNoon, timeZone), lat, lon)) {
                const start = date.setZone(timeZone).startOf('day');
                const end = date.setZone(timeZone).endOf('day');
                return [{ start: start, end: end }]
            } else {
                return []
            }
        }
        const start = date.setZone(timeZone).startOf('day');
        const end = sunset;
        return [{ start: start, end: end }]
    }

    /**Returns true if yesterday sunset happens in the current day */
    const isSpillover = sunsetDayBefore !== null && sunrise.hasSame(sunsetDayBefore, 'day');
    const sunIntervals = []

    if (isSpillover) {
        sunIntervals.push({ start: date.setZone(timeZone).startOf('day'), end: sunsetDayBefore });
    }

    sunIntervals.push({ start: sunrise, end: resolveEnd(sunset, sunrise, date, timeZone) })

    return sunIntervals
}

function toZoned(date: Date | null, zone: string): DateTime | null {
    if (date) {
        return DateTime.fromJSDate(date, { zone: zone })
    } else {
        return null
    }
}

function resolveEnd(sunset: DateTime | null, referenceMoment: DateTime, date: DateTime, timezone: string) {
    if (sunset !== null && referenceMoment.hasSame(sunset, 'day')) {
        return sunset
    } else {
        return date.setZone(timezone).endOf('day')
    }
}