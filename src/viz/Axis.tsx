import { pointToString, toPoint } from "./lib/geometry"
import type { Tick } from "./lib/types"

interface AxisProps {
    ticks: Tick[]
    length: number
    orientation: 'horizontal' | 'vertical'
    tickDirection: 1 | -1
}

function Axis({ ticks, length, orientation, tickDirection }: AxisProps) {
  const minorTickLength = 5
  const majorTickLength = 9
  const labelOffsetX = 10
  const labelOffsetY = 25
  const labelOffset = orientation === 'horizontal' ? labelOffsetX : labelOffsetY


  let path = 'M 0 0'
  path += ' L ' + pointToString(toPoint(length, 0, orientation))

  ticks.forEach((tick) => {
    const tickLength = tick.label ? majorTickLength : minorTickLength
    path += ' M '
      + pointToString(toPoint(tick.position, 0, orientation))
      + ' L '
      + pointToString(toPoint(tick.position, tickLength * tickDirection, orientation))
  })

  return (
    <g>
      <path d={path} stroke="black" strokeWidth="1" fill="none" />
      {ticks
        .filter((tick) => tick.label)
        .map((tick) => {
          const labelPoint = toPoint(tick.position, (majorTickLength + labelOffset) * tickDirection, orientation)
          const textAnchor = orientation === 'horizontal' ? 'middle' : (tickDirection === 1 ? 'end' : 'start')
          const dominantBaseline = orientation === 'horizontal' ? (tickDirection === 1 ? 'hanging' : 'auto') : 'middle'
          return (
            <text
              key={tick.label}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor={textAnchor}
              dominantBaseline={dominantBaseline}
            >
              {tick.label}
            </text>
          )
        })}
    </g>
  )
}


export default Axis