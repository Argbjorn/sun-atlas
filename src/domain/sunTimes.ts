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
        if (sunInterval.start === null || sunInterval.end=== null) {
            return
        };
        const sunPositionRange: SunPosition[] = []
        for (let time = sunInterval.start; time <= sunInterval.end; time = time.plus({ minutes: stepMinutes })) {
            sunPositionRange.push({ time: time, altitudeDeg: SunCalc.getPosition(time.toJSDate(), lat, lon).altitude });
        };
        sunPositionSeries.push(sunPositionRange);
    })
    return sunPositionSeries;
}

function getSunIntervals(date: DateTime, lat: number, lon: number): { start: DateTime | null, end: DateTime | null }[] {
    const timeZone = tzLookup(lat, lon);
    const sunTimes = SunCalc.getTimes(date.toJSDate(), lat, lon);
    const sunTimesDayBefore = SunCalc.getTimes(date.minus({ days: 1 }).toJSDate(), lat, lon);
    let start1: DateTime | null = null;
    let end1: DateTime | null = null;
    let start2: DateTime | null = null;
    let end2: DateTime | null = null;
    if (sunTimes.sunrise && sunTimesDayBefore.sunset && !DateTime.fromJSDate(sunTimes.sunrise, { zone: timeZone }).hasSame(DateTime.fromJSDate(sunTimesDayBefore.sunset, { zone: timeZone }), 'day')) {
        start1 = DateTime.fromJSDate(sunTimes.sunrise, { zone: timeZone });
        if (sunTimes.sunset == null || !DateTime.fromJSDate(sunTimes.sunset, { zone: timeZone }).hasSame(DateTime.fromJSDate(sunTimes.sunrise, { zone: timeZone }), 'day')) {
            end1 = date.setZone(timeZone).endOf('day');
        } else {
            end1 = DateTime.fromJSDate(sunTimes.sunset, { zone: timeZone })
        }
    } else if (sunTimes.sunrise && sunTimesDayBefore.sunset && DateTime.fromJSDate(sunTimes.sunrise, { zone: timeZone }).hasSame(DateTime.fromJSDate(sunTimesDayBefore.sunset, { zone: timeZone }), 'day')) {
        start1 = date.setZone(timeZone).startOf('day');
        end1 = DateTime.fromJSDate(sunTimesDayBefore.sunset, { zone: timeZone });
        start2 = DateTime.fromJSDate(sunTimes.sunrise, { zone: timeZone });
        if (sunTimes.sunset == null || !DateTime.fromJSDate(sunTimes.sunset, { zone: timeZone }).hasSame(DateTime.fromJSDate(sunTimes.sunrise, { zone: timeZone }), 'day')) {
            end2 = date.setZone(timeZone).endOf('day');
        } else {
            end2 = DateTime.fromJSDate(sunTimes.sunset, { zone: timeZone })
        }
    }
    console.log(`start1: ${start1}, end1: ${end1}, start2: ${start2}, end2: ${end2}`)
    return [{ start: start1, end: end1 }, { start: start2, end: end2 }]
}