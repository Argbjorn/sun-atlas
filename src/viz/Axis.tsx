import type { ChartPoint, Tick } from "./types"

interface AxisProps {
    ticks: Tick[]
    length: number
    orientation: 'horizontal' | 'vertical'
}

function toPoint(along: number, across: number, orientation: 'horizontal' | 'vertical'): ChartPoint {
    return orientation === 'horizontal'
        ? { x: along, y: across }
        : { x: across, y: along }
}

function pointToString(point: ChartPoint): string {
    let pointString = ''
    pointString += point.x + ' ' + point.y
    return pointString
}

function Axis({ ticks, length, orientation }: AxisProps) {
  const minorTickLength = 5
  const majorTickLength = 9
  const labelOffset = 12

  let path = 'M 0 0'
  path += ' L ' + pointToString(toPoint(length, 0, orientation))

  ticks.forEach((tick) => {
    const tickLength = tick.label ? majorTickLength : minorTickLength
    path += ' M '
      + pointToString(toPoint(tick.position, 0, orientation))
      + ' L '
      + pointToString(toPoint(tick.position, tickLength, orientation))
  })

  return (
    <g>
      <path d={path} stroke="black" strokeWidth="1" fill="none" />
      {ticks
        .filter((tick) => tick.label)
        .map((tick) => {
          const labelPoint = toPoint(tick.position, majorTickLength + labelOffset, orientation)
          return (
            <text key={tick.label} x={labelPoint.x} y={labelPoint.y}>
              {tick.label}
            </text>
          )
        })}
    </g>
  )
}


export default Axis