import moment from 'moment';

export const parseInput = (string: string): {location: string; time: string | undefined; } => {
  // define valid formats
  const validFormats = [
    'HH:mm', 'HH.mm', 'HH,mm',
    'H:mmA', 'H:mm A', 'H.mmA', 'H,mm A',
    'H A', 'HA'
  ]
  // setup output shape
  let output: {
    location: string,
    time: undefined | string
  } = {
    location: "",
    time: undefined
  }
  // merge separate am pm with time
  if (/\s(pm|am|PM|AM|Pm|Am)(?=\s|$)/g.test(string)) {
    string = string.replace(/\s(pm|am|PM|AM|Pm|Am)(?=\s|$)/g, "$1" )
  }
  // check all parts
  string.split(' ').forEach(part => {
    if( moment(part, validFormats, true).isValid()) {
      output.time = part
    } else {
      output.location = output.location.trim() + ' ' + part
    }
  })
  console.log(output)
  // return output
  return output
}