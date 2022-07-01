import { getNow, Location, Now } from './getNow';

const getItemsFromStorage = () => [
  {
    city: 'Berlin',
    country: 'germany',
    iso: 'DE',
    timezone: 'Europe/Berlin',
  },
  {
    city: 'Mumbai',
    country: 'India',
    iso: 'IN',
    timezone: 'Asia/Kolkata',
  },
  {
    city: 'London',
    country: 'united kingdom',
    iso: 'UK',
    timezone: 'Europe/London',
  },
  {
    city: 'San Francisco',
    country: 'usa',
    iso: 'US',
    timezone: 'America/Los_Angeles',
  },
  {
    city: 'Tokyo',
    country: 'japan',
    iso: 'JP',
    timezone: 'Asia/Tokyo',
  }
]

export const getFavorites = (): Now[] => {
  const currentDateObj = new Date()

  return getItemsFromStorage().map((item: Location) => getNow(currentDateObj, item))
}