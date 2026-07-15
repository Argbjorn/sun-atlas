import type { ChartPoint } from "./types"

export function toPoint(along: number, across: number, orientation: 'horizontal' | 'vertical'): ChartPoint {
    return orientation === 'horizontal'
        ? { x: along, y: across }
        : { x: across, y: along }
}

export function pointToString(point: ChartPoint): string {
    let pointString = ''
    pointString += point.x + ' ' + point.y
    return pointString
}