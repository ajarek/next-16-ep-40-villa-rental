export type Testimonial = {
  id: number
  author: string
  villa: string
  rating: number
  date: string
  text: string
  groupType: "Rodzina" | "Para" | "Przyjaciele" | "Solo"
  verified: boolean
  likes: number
  stayDuration: string
}
