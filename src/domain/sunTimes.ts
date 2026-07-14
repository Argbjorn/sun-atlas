import { DateTime } from 'luxon';
import * as SunCalc from 'suncalc'
import tzLookup from '@photostructure/tz-lookup';

export interface SunPosition {
    time: DateTime
    altitudeDeg: number
}

/** Computes sampled sun-altitude series for above-horizon interval of the
 * day, for plotting the day-length curve. */
export function getSunPositionSeries(date: DateTime, lat: number, lon: number, stepMinutes: number): SunPosition[][] {
    const sunPositionSeries: SunPosition[][] = [];
    const sunIntervals = getSunIntervals(date, lat, lon);
    sunIntervals.forEach(sunInterval => {
        const sunPositionRange: SunPosition[] = [];
        const startAltitudeDeg = resolveAltitudeDeg(sunInterval.start, lat, lon);
        const endAltitudeDeg = resolveAltitudeDeg(sunInterval.end, lat, lon);
        sunPositionRange.push({ time: sunInterval.start.time, altitudeDeg: startAltitudeDeg });
        for (let time = sunInterval.start.time.plus({ minutes: stepMinutes }); time < sunInterval.end.time; time = time.plus({ minutes: stepMinutes })) {
            sunPositionRange.push({ time: time, altitudeDeg: SunCalc.getPosition(time.toJSDate(), lat, lon).altitude });
        };
        sunPositionRange.push({ time: sunInterval.end.time, altitudeDeg: endAltitudeDeg });
        sunPositionSeries.push(sunPositionRange);
    })
    return sunPositionSeries;
}

/** Splits a day into sun-above-horizon intervals, since a day can have zero
 * (polar night), one (normal, or one edge cut off by the day boundary), or
 * two (sunset happens after midnight, spilling over from the previous day) of them. */
function getSunIntervals(date: DateTime, lat: number, lon: number): { start: { time: DateTime, isSunEvent: boolean }, end: { time: DateTime, isSunEvent: boolean } }[] {
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
                return [{ start: { time: start, isSunEvent: false }, end: { time: end, isSunEvent: false } }]
            } else {
                return []
            }
        }
        const start = date.setZone(timeZone).startOf('day');
        const end = sunset;
        return [{ start: { time: start, isSunEvent: false }, end: { time: end, isSunEvent: true } }]
    }

    /**Returns true if yesterday sunset happens in the current day */
    const isSpillover = sunsetDayBefore !== null && sunrise.hasSame(sunsetDayBefore, 'day');
    const sunIntervals = []

    if (isSpillover) {
        sunIntervals.push({ start: { time: date.setZone(timeZone).startOf('day'), isSunEvent: false }, end: { time: sunsetDayBefore, isSunEvent: true } });
    }

    const resolvedEnd = resolveEnd(sunset, sunrise, date, timeZone);
    sunIntervals.push({ start: { time: sunrise, isSunEvent: true }, end: { time: resolvedEnd.end, isSunEvent: resolvedEnd.isSunEvent } })

    return sunIntervals
}

/** Passes null through so callers can branch on a missing sun event
 * (see the isSunEvent === false paths in getSunIntervals). */
function toZoned(date: Date | null, zone: string): DateTime | null {
    if (date) {
        return DateTime.fromJSDate(date, { zone: zone })
    } else {
        return null
    }
}

/** SunCalc's sunset for `date` can actually fall on the next calendar day
 * (e.g. near the polar circle); in that case the interval is cut at the day
 * boundary instead, since that mismatched sunset doesn't belong to today. */
function resolveEnd(sunset: DateTime | null, referenceMoment: DateTime, date: DateTime, timezone: string): { end: DateTime, isSunEvent: boolean } {
    if (sunset !== null && referenceMoment.hasSame(sunset, 'day')) {
        return { end: sunset, isSunEvent: true }
    } else {
        return { end: date.setZone(timezone).endOf('day'), isSunEvent: false }
    }
}

/** Returns 0 for a real sunrise/sunset event to avoid SunCalc's tiny numerical
 * offset from the horizon; otherwise computes the actual solar altitude. */
function resolveAltitudeDeg(point: { time: DateTime, isSunEvent: boolean }, lat: number, lon: number): number {
    let altitudeDeg;
    if (point.isSunEvent) {
        altitudeDeg = 0;
    } else {
        altitudeDeg = SunCalc.getPosition(point.time.toJSDate(), lat, lon).altitude
    }
    return altitudeDeg
}