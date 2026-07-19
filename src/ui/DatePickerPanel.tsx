import { forwardRef, useRef } from "react"
import { DateTime } from "luxon"
import Datepicker from "react-datepicker"
import styles from "./DatePickerPanel.module.css"

interface DatePickerPanelProps {
    selectedDate: Date
    onDateChange: (date: Date | null) => void
}

interface DateLabelProps {
    value?: string
    onClick?: () => void
}

const DateLabel = forwardRef<HTMLButtonElement, DateLabelProps>(({ value, onClick }, ref) => (
    <button type="button" className={styles.dateLabel} onClick={onClick} ref={ref}>
        {value}
    </button>
))

function DatePickerPanel({ selectedDate, onDateChange }: DatePickerPanelProps) {
    const trackRef = useRef<HTMLDivElement>(null)

    const date = DateTime.fromJSDate(selectedDate)
    const year = date.year
    // Ordinal of Dec 31 gives the true length of the year (365 or 366).
    const daysInYear = DateTime.local(year, 12, 31).ordinal
    const dayFraction = (date.ordinal - 1) / (daysInYear - 1)

    // 13 bounds: start of each month plus the end of the year, so a label can sit at the midpoint of its interval.
    const monthBounds = Array.from({ length: 13 }, (_, i) => {
        if (i === 12) return 1
        const first = DateTime.local(year, i + 1, 1, { locale: "en-US" })
        return (first.ordinal - 1) / (daysInYear - 1)
    })

    const monthTicks = Array.from({ length: 12 }, (_, i) => {
        const first = DateTime.local(year, i + 1, 1, { locale: "en-US" })
        return {
            month: i + 1,
            label: first.toFormat("LLL"),
            labelFraction: (monthBounds[i] + monthBounds[i + 1]) / 2,
        }
    })

    function shiftDay(offset: number) {
        onDateChange(date.plus({ days: offset }).toJSDate())
    }

    function dateFromFraction(fraction: number) {
        const clamped = Math.min(1, Math.max(0, fraction))
        const dayOfYear = Math.round(clamped * (daysInYear - 1)) + 1
        return DateTime.local(year, 1, 1).plus({ days: dayOfYear - 1 }).toJSDate()
    }

    function fractionFromClientX(clientX: number) {
        const rect = trackRef.current!.getBoundingClientRect()
        return (clientX - rect.left) / rect.width
    }

    function handleTrackPointerDown(e: React.PointerEvent<HTMLDivElement>) {
        onDateChange(dateFromFraction(fractionFromClientX(e.clientX)))
    }

    function handleDotPointerDown(e: React.PointerEvent<HTMLDivElement>) {
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    function handleDotPointerMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
            return
        }
        onDateChange(dateFromFraction(fractionFromClientX(e.clientX)))
    }

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <button type="button" className={styles.arrow} onClick={() => shiftDay(-1)}>‹</button>
                <Datepicker
                    selected={selectedDate}
                    dateFormat="d MMMM yyyy"
                    calendarStartDay={1}
                    popperPlacement="bottom"
                    customInput={<DateLabel />}
                    onChange={onDateChange}
                    portalId="datepicker-portal"
                />
                <button type="button" className={styles.arrow} onClick={() => shiftDay(1)}>›</button>
            </div>

            <div className={styles.trackWrap}>
                <div className={styles.track} ref={trackRef} onPointerDown={handleTrackPointerDown}>
                    <div className={styles.trackLine} />
                    {monthBounds.map((fraction, i) => (
                        <span key={i} className={styles.tickMark} style={{ left: `${fraction * 100}%` }} />
                    ))}
                    {monthTicks.map(tick => (
                        <span key={tick.month} className={styles.tickLabel} style={{ left: `${tick.labelFraction * 100}%` }}>
                            {tick.label}
                        </span>
                    ))}
                    <div
                        className={styles.dot}
                        style={{ left: `${dayFraction * 100}%` }}
                        onPointerDown={handleDotPointerDown}
                        onPointerMove={handleDotPointerMove}
                    />
                </div>
            </div>
        </div>
    )
}

export default DatePickerPanel
