import { DateTime } from 'luxon';
import * as SunCalc from 'suncalc'
import tzLookup from '@photostructure/tz-lookup';

export interface SunPosition {
    time: DateTime
    altitudeDeg: number
}

export function getSunPositionSeries(date: DateTime, lat: number, lon: number, stepMinutes: number): SunPosition[] {
    const sunPositionSeries: SunPosition[] = [];
    const dayBounds = getDayBounds(date, lat, lon);
    for (let time = dayBounds.startPoint; time <= dayBounds.endPoint; time = time.plus({ minutes: stepMinutes })) {
        sunPositionSeries.push({time: time, altitudeDeg: SunCalc.getPosition(time.toJSDate(), lat, lon).altitude});
    }
    return sunPositionSeries;
}

function getDayBounds(date: DateTime, lat: number, lon: number): {startPoint: DateTime, endPoint: DateTime} {
    const timeZone = tzLookup(lat, lon);
    const sunTimes = SunCalc.getTimes(date.toJSDate(), lat, lon);
    let startPoint: DateTime;
    if (sunTimes.sunrise == null) {
        startPoint = date.setZone(timeZone).startOf('day');
    } else {
        startPoint = DateTime.fromJSDate(sunTimes.sunrise, {zone: timeZone});
    }
    let endPoint: DateTime;
    if (sunTimes.sunset == null) {
        endPoint = date.setZone(timeZone).endOf('day');
    } else {
        endPoint = DateTime.fromJSDate(sunTimes.sunset, {zone: timeZone})
    }
    return {startPoint: startPoint, endPoint: endPoint}
}