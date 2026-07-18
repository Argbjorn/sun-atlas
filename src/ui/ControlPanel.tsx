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
    onDateChange: (date: Date | null) => void
}

function ControlPanel({ cities, selectedDate, onCitySelect, onCityRemove, onDateChange }: ControlPanelProps) {
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
                />
            </div>
            <DatePickerPanel selectedDate={selectedDate} onDateChange={onDateChange} />
        </div>
    )
}

export default ControlPanel
