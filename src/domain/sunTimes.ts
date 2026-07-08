import { DateTime } from 'luxon';
import * as SunCalc from 'suncalc'

interface SunPosition {
    time: DateTime
    altitudeDeg: number
}

export function getSunPositionSeries(date: DateTime, lat: number, lon: number, stepMinutes: number): SunPosition[] {
    const sunTimes = SunCalc.getTimes(date.toJSDate(), lat, lon);
    let sunPositionSeries: SunPosition[] = [];
    let startPoint: DateTime;
    if (sunTimes.sunrise == null) {
        startPoint = date.startOf('day');
    } else {
        startPoint = DateTime.fromJSDate(sunTimes.sunrise)
    }
    let endPoint: DateTime;
    if (sunTimes.sunset == null) {
        endPoint = date.endOf('day');
    } else {
        endPoint = DateTime.fromJSDate(sunTimes.sunset)
    }

    for (let time = startPoint; time <= endPoint; time = time.plus({ minutes: stepMinutes })) {
        sunPositionSeries.push({time: time, altitudeDeg: SunCalc.getPosition(time.toJSDate(), lat, lon).altitude});
        console.log(sunPositionSeries)
    }
    return sunPositionSeries;
}