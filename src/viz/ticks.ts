import type { DateTime } from "luxon";
import type { Tick } from "./Axis";
import { scaleX, scaleY } from "./scale";

export function generateTimeTicks(
  referenceDate: DateTime,
  width: number,
  stepHours: number,
  labelEveryNth: number
): Tick[] {
  const ticks: Tick[] = []
  const dayStart = referenceDate.startOf('day')

  for (let h = 0; h <= 24; h += stepHours) {
    const t = dayStart.plus({ hours: h })
    ticks.push({
      position: scaleX(t, width),
      label: (h / stepHours) % labelEveryNth === 0 ? t.toFormat('HH:mm') : undefined
    })
  }
  return ticks
}

export function generateAltitudeTicks(height: number, stepDeg: number, labelEveryNth: number): Tick[] {
  const ticks: Tick[] = []
  for (let deg = 0; deg <= 90; deg += stepDeg) {
    ticks.push({
      position: scaleY(deg, height),
      label: (deg / stepDeg) % labelEveryNth === 0 ? `${deg}°` : undefined
    })
  }
  console.log(ticks);
  return ticks
}
