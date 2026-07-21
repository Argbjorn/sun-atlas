import { DateTime, Duration } from 'luxon';
import * as SunCalc from 'suncalc'
import tzLookup from '@photostructure/tz-lookup';

export interface SunPosition {
    time: DateTime
    altitudeDeg: number
}

export function getSunPositionSeries(date: DateTime, lat: number, lon: number, stepMinutes: number, zone?: string): SunPosition[][] {
    const sunPositionSeries: SunPosition[][] = [];
    const sunIntervals = getSunIntervals(date, lat, lon, zone);
    sunIntervals.forEach(sunInterval => {
        const sunPositionRange: SunPosition[] = []
        for (let time = sunInterval.start; time < sunInterval.end; time = time.plus({ minutes: stepMinutes })) {
            sunPositionRange.push({ time: time, altitudeDeg: SunCalc.getPosition(time.toJSDate(), lat, lon).altitude });
        };
        sunPositionRange.push({ time: sunInterval.end, altitudeDeg: SunCalc.getPosition(sunInterval.end.toJSDate(), lat, lon).altitude })
        sunPositionSeries.push(sunPositionRange);
    });
    return sunPositionSeries;
}

export function getSunSummary(date: DateTime, lat: number, lon: number): { sunrise: DateTime | null, sunset: DateTime | null, solarNoonTime: DateTime | null, solarNoonDeg: number | null, dayLength: Duration | null } {
    const timeZone = tzLookup(lat, lon);
    const localDate = anchorToZone(date, timeZone);
    const sunTimes = SunCalc.getTimes(localDate.set({ hour: 12 }).toJSDate(), lat, lon);
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

export function getYearEvents(year: number): { marEquinox: DateTime, sepEquinox: DateTime, junSolstice: DateTime, decSolstice: DateTime } {
    const y = (year - 2000) / 1000;
    return {
        marEquinox: julianDayToDate(getJDE0(y, 'mar')),
        junSolstice: julianDayToDate(getJDE0(y, 'jun')),
        sepEquinox: julianDayToDate(getJDE0(y, 'sep')),
        decSolstice: julianDayToDate(getJDE0(y, 'dec')),
    }
}

function getJDE0(y: number, season: 'mar' | 'jun' | 'sep' | 'dec'): number {
    const seasonConst = {
        mar: [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],
        jun: [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030],
        sep: [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],
        dec: [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032],
    }
    const [c0, c1, c2, c3, c4] = seasonConst[season];
    return c0 + c1 * y + c2 * y ** 2 + c3 * y ** 3 + c4 * y ** 4;
}

// Meeus, Astronomical Algorithms ch. 7 (Julian day -> Gregorian calendar date); valid for all dates this app deals with (post-1582)
function julianDayToDate(jde: number): DateTime {
    const Z = Math.floor(jde + 0.5);
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    const A = Z + 1 + alpha - Math.floor(alpha / 4);
    const B = A + 1524;
    const C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D) / 30.6001);
    const day = Math.floor(B - D - Math.floor(30.6001 * E));
    const month = E < 14 ? E - 1 : E - 13;
    const year = month > 2 ? C - 4716 : C - 4715;
    return DateTime.utc(year, month, day);
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

/**
 * Builds sun-above-horizon intervals for the calendar day of `date` in `timeZone`.
 * Sunrise/sunset are computed astronomically per-day and only afterwards clipped to the
 * zone's day boundary — computing them relative to a single "local noon" (as before) breaks
 * when `zone` is far from `lon`, since sunrise/sunset can then fall outside the nominal day
 * they were computed for, or even precede it, producing an inverted (start > end) interval.
 */
function getSunIntervals(date: DateTime, lat: number, lon: number, zone?: string): { start: DateTime, end: DateTime }[] {
    const timeZone = zone ?? tzLookup(lat, lon);
    const localDate = anchorToZone(date, timeZone);
    const dayStart = localDate.startOf('day');
    const dayEnd = localDate.endOf('day');

    const candidateIntervals = [-1, 0, 1].flatMap(dayOffset => {
        const day = localDate.plus({ days: dayOffset });
        const sunTimes = SunCalc.getTimes(day.set({ hour: 12 }).toJSDate(), lat, lon);
        const sunrise = toZoned(sunTimes.sunrise, timeZone);
        const sunset = toZoned(sunTimes.sunset, timeZone);

        if (sunrise === null && sunset === null) {
            if (isPolarDay(toZoned(sunTimes.solarNoon, timeZone), lat, lon)) {
                return [{ start: dayStart, end: dayEnd }]
            }
            return []
        }
        if (sunrise === null) {
            return [{ start: dayStart, end: sunset! }]
        }
        if (sunset === null) {
            return [{ start: sunrise, end: dayEnd }]
        }
        return [{ start: sunrise, end: sunset }]
    });

    return candidateIntervals
        .map(({ start, end }) => ({
            start: start < dayStart ? dayStart : start,
            end: end > dayEnd ? dayEnd : end
        }))
        .filter(({ start, end }) => start < end)
        .sort((a, b) => a.start.toMillis() - b.start.toMillis())
}

/**Reconstructs the calendar day (Y/M/D) of `date` anchored in `zone`, so day-boundary math isn't skewed by date's original zone/instant */
function anchorToZone(date: DateTime, zone: string): DateTime {
    return DateTime.fromObject({ year: date.year, month: date.month, day: date.day }, { zone: zone });
}

function toZoned(date: Date | null, zone: string): DateTime | null {
    if (date) {
        return DateTime.fromJSDate(date, { zone: zone })
    } else {
        return null
    }
}
