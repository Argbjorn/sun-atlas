import { useState, useEffect } from "react"
import type { PhotonFeature } from "../viz/lib/types";

interface CityAutocompleteProps {
    onSelect: (feature: PhotonFeature) => void
}

function CityAutocomplete({ onSelect }: CityAutocompleteProps) {
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
        <div>
            <input value={query} onChange={e => setQuery(e.target.value)} />
            {suggestions.length > 0 && <ul>{suggestions.map(feature => <li key={feature.properties.osm_id} onClick={() => onSelect(feature)}>{feature.properties.name}{feature.properties.state && `, ${feature.properties.state}`}{feature.properties.country && `, ${feature.properties.country}`} </li>)}</ul>}
        </div>
    )
}

export default CityAutocomplete