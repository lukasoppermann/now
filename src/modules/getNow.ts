import { Moment } from 'moment-timezone';

const moment = require('moment-timezone')
export interface Now {
  location: string;
  country: string;
  iso: string;
  timezone: string;
  time: string;
  time12: string;
  offset: string;
  comparedToMe: string;
  population?: number
}

export interface Location {
  city: string,
  country: string,
  iso: string,
  timezone: string,
  population?: number
}

const comparedToMe = (myNow: Moment, theirNow: Moment) => {
  // you are ahead
  if (myNow.isBefore(theirNow.format('YYYY-MM-DD'), 'days')) return 'tomorrow'
  // they are ahead
  if (myNow.isAfter(theirNow.format('YYYY-MM-DD'), 'days')) return 'yesterday'
  // same day
  return 'today'
}

const formatDiff = (diff: number): string => {
  const hours =  (diff - diff % 60) / 60
  const minutes = diff % 60

  if (minutes === 0) return `${hours}`
  return `${hours}:${minutes}`
} 


const offsetToMe = (myNow: Moment, theirNow: Moment): string => {
  const myOffset = myNow.utcOffset()
  const theirOffset = theirNow.utcOffset()

  if (Math.sign(myOffset) === Math.sign(theirOffset)) {
    const diff = Math.abs(myOffset - theirOffset)
    // same time zone
    if (diff === 0) return ""
    // ealier than you
    if (Math.abs(theirOffset) < Math.abs(myOffset)) return `(-${formatDiff(diff)}) `
    // later than you
    return `(+${formatDiff(diff)}) `

  } else {
    const diff = Math.abs(myOffset) + Math.abs(theirOffset)
    return  `(${(""+Math.sign(theirOffset)).slice(0,-1)}${formatDiff(diff)}) `
  }
}

export const getNow = (now: Date, location: Location): Now => {
  // setup format
  const myNow = moment(now)
  const theirNow = myNow.clone().tz(location.timezone)
  console.log(location.timezone, theirNow.format())
  // @ts-ignore
  // const theirDate = new Date(Date.UTC(theirParts.year, theirParts.month-1, theirParts.day, theirParts.hour, theirParts.minute, theirParts.second))

  return {
    location: location.city,
    country: location.country,
    iso: location.iso,
    timezone: location.timezone,
    time: theirNow.format('HH:mm'),
    time12: theirNow.format('hh:mm a'),
    offset: offsetToMe(myNow, theirNow),
    comparedToMe: comparedToMe(myNow, theirNow),
    population: location.population
  }
}