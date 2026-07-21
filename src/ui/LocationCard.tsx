import { useEffect, useRef, useState } from "react"
import type { DateTime } from "luxon"
import type { CityEntry, PhotonFeature } from "../viz/lib/types"
import { getSunSummary } from "../domain/sunTimes"
import CityAutocomplete from "./CityAutocomplete"
import styles from "./LocationCard.module.css"

interface LocationCardProps {
    role: 'primary' | 'secondary'
    city: CityEntry | null
    date: DateTime
    onSelect: (feature: PhotonFeature) => void
    onRemove?: () => void
    matchPrimaryTz?: boolean
    onToggleMatchPrimaryTz?: () => void
    primaryColor?: string
    onSwapWithPrimary?: () => void
}

function LocationCard({ role, city, date, onSelect, onRemove, matchPrimaryTz, onToggleMatchPrimaryTz, primaryColor, onSwapWithPrimary }: LocationCardProps) {
    const [isSearching, setIsSearching] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isSearching) {
            return
        }
        function handleClickOutside(event: MouseEvent) {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setIsSearching(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isSearching])

    if (!city) {
        return (
            <div className={styles.card} ref={cardRef}>
                {isSearching ? (
                    <div className={styles.searchOverlay}>
                        <CityAutocomplete onSelect={onSelect} onBlur={() => setIsSearching(false)} />
                    </div>
                ) : (
                    <button className={styles.placeholder} onClick={() => setIsSearching(true)}>
                        {role === 'primary' ? 'Select location' : 'Select location to compare'}
                    </button>
                )}
            </div>
        )
    }

    const { sunrise, sunset, solarNoonDeg, dayLength } = getSunSummary(
        date,
        city.feature.geometry.coordinates[1],
        city.feature.geometry.coordinates[0]
    )

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.dot} style={{ backgroundColor: city.color, boxShadow: `0 0 8px ${city.color}` }} />
                <span className={styles.title}>
                    {city.feature.properties.name}
                    {city.feature.properties.country && `, ${city.feature.properties.country}`}
                </span>
                {role === 'secondary' && onSwapWithPrimary && (
                    <button className={styles.swapButton} onClick={onSwapWithPrimary} aria-label="Swap with primary location">⇄</button>
                )}
                <button className={styles.closeButton} onClick={onRemove}>×</button>
            </div>

            <div className={styles.body}>
                <div className={styles.coords}>
                    {city.feature.geometry.coordinates[1].toFixed(2)}°, {city.feature.geometry.coordinates[0].toFixed(2)}°
                </div>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Sunrise</span>
                        <span className={styles.statValue}>{sunrise ? sunrise.toFormat('HH:mm') : '—'}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Sunset</span>
                        <span className={styles.statValue}>{sunset ? sunset.toFormat('HH:mm') : '—'}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Solar noon</span>
                        <span className={styles.statValue}>{solarNoonDeg !== null ? `${Math.round(solarNoonDeg)}°` : '—'}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Day length</span>
                        <span className={styles.statValue}>{dayLength ? dayLength.shiftTo('hours', 'minutes').toFormat("h'h' mm'm'") : '—'}</span>
                    </div>
                </div>

                {role === 'secondary' && (
                    <div className={styles.tzToggleRow}>
                        <div className={styles.tzSegmented} role="group">
                            <button
                                className={styles.tzSegment}
                                aria-pressed={!matchPrimaryTz}
                                style={!matchPrimaryTz ? { background: city.color } : undefined}
                                onClick={() => matchPrimaryTz && onToggleMatchPrimaryTz?.()}
                            >
                                Local timezone
                            </button>
                            <button
                                className={styles.tzSegment}
                                aria-pressed={matchPrimaryTz}
                                style={matchPrimaryTz && primaryColor ? { background: primaryColor } : undefined}
                                onClick={() => !matchPrimaryTz && onToggleMatchPrimaryTz?.()}
                            >
                                Primary timezone
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LocationCard
