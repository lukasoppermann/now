const comparedToMe = (myDate: string, theirDate: string) => {
  console.log(myDate, theirDate)
  const local = new Date(myDate)
  const theirs = new Date(theirDate)
  // you are ahead
  if (local > theirs) return 'yesterday'
  // they are ahead
  if (local < theirs) return 'tomorrow'
  // same day
  return 'today'
}

// const offsetToMe = (myTime, theirTime)

export const getNow = (now: Date, timezone: string) => {
  
  // // current date
  // // adjust 0 before single digit date
  // let date = ("0" + date_ob.getDate()).slice(-2);

  // // current month
  // let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  // // current year
  // let year = date_ob.getFullYear();

  // // current hours
  // let hours = date_ob.getHours();

  // // current minutes
  // let minutes = date_ob.getMinutes();

  // // current seconds
  // let seconds = date_ob.getSeconds();

  let options = {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: 'numeric',
  } as Intl.DateTimeFormatOptions
  
  let formatter = new Intl.DateTimeFormat([], options)

  const theirParts = Object.fromEntries(formatter.formatToParts(now).map(part => [part.type, part.value]))
  // prints date & time in YYYY-MM-DD HH:MM:SS format
  console.log(timezone)
  console.log(theirParts)
  console.log(now, `${now.getFullYear()}-${now.getMonth()}-${now.getDay()}`)
  // return formatter.formatToParts(now)
  return {
    time: `${theirParts.hour}:${theirParts.minute}`,
    offset: 'not implemented',
    comparedToMe: comparedToMe(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`,`${theirParts.year}-${theirParts.month}-${theirParts.day}`)
  }
}