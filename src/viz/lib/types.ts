export interface ChartPoint {
    x: number
    y: number
}

export interface CityEntry {
  feature: PhotonFeature
  color: string
}

export interface Margin {
    top: number
    right: number
    bottom: number
    left: number
}

export interface PhotonFeature {
    properties: {
        country?: string
        name: string
        osm_id: number
        state?: string
    }
    geometry: {
        coordinates: [number, number]
    }
}

export interface Tick {
    position: number
    label?: string
}

export interface WindowSize {
    width: number
    height: number
}