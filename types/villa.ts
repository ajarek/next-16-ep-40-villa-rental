export type Review = {
  author: string
  rating: number
  date: string
  text: string
}

export type Villa = {
  id: string
  name: string
  price: number
  rating: number
  reviewsCount: number
  distanceToBeach: number
  numberOfPeople: number
  status: string
  image: string
  featured: boolean
  amenities: string[]
  location: string
  description: string
  gallery: string[]
  coordinates: { lat: number; lng: number }
  rules: {
    checkIn: string
    checkOut: string
    minimumStay: number
    smoking: boolean
    pets: boolean
    parties: boolean
  }
  reviews: Review[]
}

export type VillaData = {
  id: string
  name: string
  price: number
  rating: number
  image: string
  location: string
  distanceToBeach: number
  numberOfPeople: number
  status: string
}

export type SortOption = "popularne" | "cena-rosnąco" | "cena-malejąco" | "ocena" | "odległość"

export type Filters = {
  priceMin: number
  priceMax: number
  amenities: string[]
  location: string
}
