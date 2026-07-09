import Axis from "./Axis"
import type { ChartPoint, Margin, Tick } from "./types";

interface DayLengthChartProps {
    charts: {
        points: ChartPoint[]
        stroke: string
    }[]
    xTicks: Tick[]
    yTicks: Tick[]
    width: number
    height: number
    margin: Margin
}

function pathFromPoints(points: ChartPoint[]): string {
    if (points.length < 2) {
        throw new Error("At least two points needed")
    }
    let path: string = 'M '
    for (let i = 0; i < points.length; i++) {
        path += points[i].x + ',' + points[i].y
        if (i != points.length - 1) {
            path += ' L '
        }
    }
    return path;
}

function DayLengthChart({ charts, xTicks, yTicks, width, height, margin }: DayLengthChartProps) {
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom
    return (
        <>
            <svg width={width} height={height}>
                <g transform={`translate(${margin.left},${margin.top})`}>
                    {
                        charts.map((chart, index) => (
                            <path d={pathFromPoints(chart.points)} stroke={chart.stroke} strokeWidth="2" fill="none" key={index} />
                        ))
                    }
                    <Axis ticks={yTicks} orientation="vertical" length={innerHeight} tickDirection={-1} />
                    <g transform={`translate(0,${innerHeight})`}>
                        <Axis ticks={xTicks} orientation="horizontal" length={innerWidth} tickDirection={1} />
                    </g>
                </g>
            </svg>
        </>
    )
}

export default DayLengthChart