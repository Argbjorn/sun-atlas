import type { DateTime } from "luxon";
import type { Tick } from "./types";
import { scaleX, scaleY } from "./scale";

export function generateTimeTicks(referenceDate: DateTime, width: number, stepHours: number, labelEveryNth: number): Tick[] {
    const ticks: Tick[] = []
    const dayStart = referenceDate.startOf('day')

    for (let h = 0; h <= 24; h += stepHours) {
        const t = dayStart.plus({ hours: h });
        const position = h === 24 ? width : scaleX(t, width)
        ticks.push({
            position: position,
            label: (h / stepHours) % labelEveryNth === 0 ? (h === 24 ? '24' : t.toFormat('HH')) : undefined
        })
    }
    return ticks
}

export function generateAltitudeTicks(height: number, stepDeg: number, labelEveryNth: number): Tick[] {
    const ticks: Tick[] = []
    for (let deg = 0; deg <= 90; deg += stepDeg) {
        // 0° sits right on the X axis line — labeling it would overlap the axis, so skip it.
        const isLabeled = deg !== 0 && (deg / stepDeg) % labelEveryNth === 0
        ticks.push({
            position: scaleY(deg, height),
            label: isLabeled ? `${deg}°` : undefined
        })
    }
    return ticks
}
