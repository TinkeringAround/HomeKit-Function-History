import * as moment from 'moment'

//--------------------------------------------------------
export const isToday = (timestamp: string) => {
  if (timestamp === '') return false

  const formattedTimestamp = moment.unix(parseInt(timestamp))
  const currentTime = moment(moment.now())

  return formattedTimestamp.isSame(currentTime, 'day')
}

//--------------------------------------------------------
export const getCurrentTime = (): string => {
  return (moment.now() / 1000).toString()
}
