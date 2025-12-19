import { HomeClient } from "./HomeClient"

// Enable ISR: Revalidate this page every hour
export const revalidate = 3600

export default function Home() {
  return <HomeClient />
}
