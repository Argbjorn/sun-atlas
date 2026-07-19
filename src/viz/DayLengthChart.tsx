import Axis from "./Axis"
import ChartGrid from "./ChartGrid";
import type { ChartPoint, Margin, Tick } from "./lib/types";
import styles from "./DayLengthChart.module.css"
import { CHART_GRID_COLOR, CHART_GRID_COLOR_FAINT } from "../config/chartTheme";

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
        <div className={styles.panel}>
            <div className={styles.instrumentLabel}>Sun altitude, °</div>
            <svg width={width} height={height}>
                <defs>
                    <filter id="dayLengthGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <g transform={`translate(${margin.left},${margin.top})`}>
                    <ChartGrid
                        width={innerWidth}
                        heigth={innerHeight}
                        ticks={{ xTicks: xTicks, yTicks: yTicks }}
                        showXTicks={'all'}
                        showYTicks={'onlyLabeled'}
                        style={{
                            main: { color: CHART_GRID_COLOR, strokeWidth: 1 },
                            secondary: { color: CHART_GRID_COLOR_FAINT, strokeWidth: 0.5 },
                        }}
                    />
                    {
                        charts.map((chart, index) => (
                            <path
                                d={pathFromPoints(chart.points)}
                                stroke={chart.stroke}
                                strokeWidth="2"
                                fill="none"
                                filter="url(#dayLengthGlow)"
                                key={index}
                            />
                        ))
                    }
                    <Axis ticks={yTicks} orientation="vertical" length={innerHeight} tickDirection={1} />
                    <g transform={`translate(0,${innerHeight})`}>
                        <Axis ticks={xTicks} orientation="horizontal" length={innerWidth} tickDirection={1} />
                    </g>
                </g>
            </svg>
        </div>
    )
}

export default DayLengthChart