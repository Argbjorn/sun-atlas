export interface ChartPoint {
        x: number
        y: number
    }

interface DayLengthChartProps {
    points: ChartPoint[]
    width: number
    height: number
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

function DayLengthChart({points, width, height}: DayLengthChartProps) {
    return (
        <>
            <svg width={width} height={height}>
                <path d={pathFromPoints(points)} stroke="black" strokeWidth="2" fill="none"/>
            </svg>
        </>
    )
}

export default DayLengthChart