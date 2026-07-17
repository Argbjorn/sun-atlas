import type { DateTime } from "luxon"
import type { CityEntry, PhotonFeature } from "../viz/lib/types"
import { getSunSummary } from "../domain/sunTimes"
import CityAutocomplete from "./CityAutocomplete"

interface LocationCardProps {
    role: 'primary' | 'secondary'
    city: CityEntry | null
    date: DateTime
    onSelect: (feature: PhotonFeature) => void
    onRemove?: () => void
}

function LocationCard({ role, city, date, onSelect, onRemove }: LocationCardProps) {
    if (!city) {
        return (
            <div>
                <span>{role === 'primary' ? 'Primary' : 'Secondary'}</span>
                <CityAutocomplete onSelect={onSelect} />
            </div>
        )
    }

    const { sunrise, sunset, solarNoonDeg, dayLength } = getSunSummary(
        date,
        city.feature.geometry.coordinates[1],
        city.feature.geometry.coordinates[0]
    )

    return (
        <div>
            <span style={{ color: city.color }}>●</span>
            <span>
                {city.feature.properties.name}
                {city.feature.properties.state && `, ${city.feature.properties.state}`}
                {city.feature.properties.country && `, ${city.feature.properties.country}`}
            </span>
            <span>{role === 'primary' ? 'Primary' : 'Secondary'}</span>
            {role === 'secondary' && <button onClick={onRemove}>×</button>}

            <div>
                {city.feature.geometry.coordinates[1].toFixed(2)}°, {city.feature.geometry.coordinates[0].toFixed(2)}°
            </div>

            <div>
                <div>
                    <span>Sunrise</span>
                    <span>{sunrise ? sunrise.toFormat('HH:mm') : '—'}</span>
                </div>
                <div>
                    <span>Sunset</span>
                    <span>{sunset ? sunset.toFormat('HH:mm') : '—'}</span>
                </div>
                <div>
                    <span>Solar noon</span>
                    <span>{solarNoonDeg !== null ? `${Math.round(solarNoonDeg)}°` : '—'}</span>
                </div>
                <div>
                    <span>Day length</span>
                    <span>{dayLength ? dayLength.shiftTo('hours', 'minutes').toFormat("h'h' mm'm'") : '—'}</span>
                </div>
            </div>
        </div>
    )
}

export default LocationCard
