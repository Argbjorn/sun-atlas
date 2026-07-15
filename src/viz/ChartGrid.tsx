import { pointToString, toPoint } from "./lib/geometry"
import type { Tick } from "./lib/types"

interface ChartGridProps {
    width: number
    heigth: number
    ticks: {
        xTicks: Tick[]
        yTicks: Tick[]
    }
    showXTicks: TickVisibility
    showYTicks: TickVisibility
    style?: {
        main: LineStyle
        secondary: LineStyle
    }
}

type TickVisibility = 'all' | 'onlyLabeled' | 'no';
type LineStyle = { color: string, strokeWidth: number }

function ChartGrid({ width, heigth, ticks, showXTicks, showYTicks, style = { main: { color: "grey", strokeWidth: 0.8 }, secondary: { color: "grey", strokeWidth: 0.5 } } }: ChartGridProps) {
    const xLines = getChartLines(width, heigth, ticks.xTicks, showXTicks, 'horizontal');
    const yLines = getChartLines(width, heigth, ticks.yTicks, showYTicks, 'vertical');

    return (
        <g>
            <path d={xLines.labeledPath} stroke={style.main.color} strokeWidth={style.main.strokeWidth} fill="none" />
            <path d={xLines.unlabeledPath} stroke={style.secondary.color} strokeWidth={style.secondary.strokeWidth} fill="none" />
            <path d={yLines.labeledPath} stroke={style.main.color} strokeWidth={style.main.strokeWidth} fill="none" />
            <path d={yLines.unlabeledPath} stroke={style.secondary.color} strokeWidth={style.secondary.strokeWidth} fill="none" />
        </g>
    )
}

function getChartLines(width: number, heigth: number, ticks: Tick[], showTicks: TickVisibility, orientation: 'horizontal' | 'vertical'): { labeledPath: string, unlabeledPath: string } {
    const gridLineLength = orientation === 'horizontal' ? heigth : width;
    const paths = { labeledPath: '', unlabeledPath: '' };
    const labeledTicks = ticks.filter(t => t.label)
    const unlabeledTicks = ticks.filter(t => !t.label)
    if (showTicks === 'onlyLabeled' || showTicks === 'all') {
        paths.labeledPath = getChartLinePath(labeledTicks, gridLineLength, orientation)
    }
    if (showTicks === 'all') {
        paths.unlabeledPath = getChartLinePath(unlabeledTicks, gridLineLength, orientation)
    }
    return paths;
}

function getChartLinePath(ticks: Tick[], gridLineLength: number, orientation: 'horizontal' | 'vertical'): string {
    let path = '';
    ticks.forEach((tick) => {
        path += ' M '
            + pointToString(toPoint(tick.position, 0, orientation))
            + ' L '
            + pointToString(toPoint(tick.position, gridLineLength, orientation));
    })
    return path
}

export default ChartGrid