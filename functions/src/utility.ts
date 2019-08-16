import * as moment from 'moment'

export const isToday = (timestamp: string) => {
  if (timestamp === '') return false

  const formattedTimestamp = moment.unix(parseInt(timestamp))
  return formattedTimestamp.isSame(moment(), 'days') && formattedTimestamp.isSame(moment(), 'year')
}

export const getCurrentTime = (): string => {
  return moment.now().toString()
}
