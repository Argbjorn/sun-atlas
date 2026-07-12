import { DateTime, Interval } from "luxon";
import type { SunPosition } from "../domain/sunTimes";
import type { ChartPoint } from "./types";

export function scaleX(time: DateTime, width: number): number {
    const timeFromDayStart: number = Interval.fromDateTimes(time.startOf('day'), time).length()
    return timeFromDayStart / 86400000 * width
}

export function scaleY(altitudeDeg: number, height: number): number {
    return height - (altitudeDeg / 90 * height)
}

export function toChartPoints(series: SunPosition[], width: number, height: number): ChartPoint[] {
    const chartPoints: ChartPoint[] = []
    series.forEach((position) => {
        const x: number = scaleX(position.time, width);
        const y: number = scaleY(position.altitudeDeg, height);
        chartPoints.push({x: x, y: y})
    })
    return chartPoints;
}