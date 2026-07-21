import { DateTime } from "luxon"
import type { CityEntry, PhotonFeature } from "../viz/lib/types"
import LocationCard from "./LocationCard"
import DatePickerPanel from "./DatePickerPanel"
import styles from "./ControlPanel.module.css"

interface ControlPanelProps {
    cities: { primary: CityEntry | null, secondary: CityEntry | null }
    selectedDate: Date
    onCitySelect: (role: 'primary' | 'secondary', feature: PhotonFeature) => void
    onCityRemove: (role: 'primary' | 'secondary') => void
    onCitySwap: () => void
    onDateChange: (date: Date | null) => void
    matchPrimaryTz: boolean
    onToggleMatchPrimaryTz: () => void
}

function ControlPanel({ cities, selectedDate, onCitySelect, onCityRemove, onCitySwap, onDateChange, matchPrimaryTz, onToggleMatchPrimaryTz }: ControlPanelProps) {
    const date = DateTime.fromJSDate(selectedDate)

    return (
        <div className={styles.panel}>
            <div className={styles.cards}>
                <LocationCard
                    role="primary"
                    city={cities.primary}
                    date={date}
                    onSelect={(feature) => onCitySelect('primary', feature)}
                    onRemove={() => onCityRemove('primary')}
                />
                <LocationCard
                    role="secondary"
                    city={cities.secondary}
                    date={date}
                    onSelect={(feature) => onCitySelect('secondary', feature)}
                    onRemove={() => onCityRemove('secondary')}
                    matchPrimaryTz={matchPrimaryTz}
                    onToggleMatchPrimaryTz={onToggleMatchPrimaryTz}
                    primaryColor={cities.primary?.color}
                    hasPrimary={!!cities.primary}
                    onSwapWithPrimary={cities.primary ? onCitySwap : undefined}
                />
            </div>
            <DatePickerPanel selectedDate={selectedDate} onDateChange={onDateChange} />
        </div>
    )
}

export default ControlPanel
