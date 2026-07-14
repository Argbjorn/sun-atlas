import { DateTime } from 'luxon';
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

function getSunIntervals(date: DateTime, lat: number, lon: number): { start: DateTime, end: DateTime }[] {
    const timeZone = tzLookup(lat, lon);
    const sunTimes = SunCalc.getTimes(date.toJSDate(), lat, lon);
    const sunTimesDayBefore = SunCalc.getTimes(date.minus({ days: 1 }).toJSDate(), lat, lon);

    const sunrise = toZoned(sunTimes.sunrise, timeZone);
    const sunset = toZoned(sunTimes.sunset, timeZone);
    const sunsetDayBefore = toZoned(sunTimesDayBefore.sunset, timeZone);

    if (sunrise === null) {
        if (sunset === null) {
            const solarNoonAltitude = SunCalc.getPosition(sunTimes.solarNoon, lat, lon).altitude
            if (solarNoonAltitude > 0) {
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