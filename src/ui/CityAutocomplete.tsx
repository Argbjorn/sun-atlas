import { useState, useEffect } from "react"
import type { PhotonFeature } from "../viz/lib/types";
import styles from "./CityAutocomplete.module.css"

interface CityAutocompleteProps {
    onSelect: (feature: PhotonFeature) => void
    onBlur?: () => void
}

function CityAutocomplete({ onSelect, onBlur }: CityAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (query === '') {
                setSuggestions([])
            } else {
                fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`).then((response) => response.json()).then((data) => setSuggestions(data.features));
            }
        }, 300);
        return () => {
            clearTimeout(timeout);
        }
    }, [query]);

    return (
        <div className={styles.wrapper}>
            <input className={styles.input} autoFocus value={query} onChange={e => setQuery(e.target.value)} onBlur={onBlur} />
            {suggestions.length > 0 && (
                <ul className={styles.suggestions} onMouseDown={e => e.preventDefault()}>
                    {suggestions.map(feature => (
                        <li className={styles.suggestion} key={feature.properties.osm_id} onClick={() => onSelect(feature)}>
                            {feature.properties.name}
                            {feature.properties.state && `, ${feature.properties.state}`}
                            {feature.properties.country && `, ${feature.properties.country}`}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default CityAutocomplete
