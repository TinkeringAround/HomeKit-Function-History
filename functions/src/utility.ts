import * as moment from 'moment'

export const isToday = (timestamp: string) => {
  if (timestamp === '') return false

  const formattedTimestamp = moment.unix(parseInt(timestamp))
  const currentTime = moment(moment.now())

  console.log('Time-Compare: ', {
    time: getCurrentTime(),
    differenceToNow: formattedTimestamp.diff(currentTime),
    days: formattedTimestamp.isSame(currentTime, 'day'),
    months: formattedTimestamp.isSame(currentTime, 'month'),
    years: formattedTimestamp.isSame(currentTime, 'year')
  })

  return formattedTimestamp.isSame(currentTime, 'day')
}

export const getCurrentTime = (): string => {
  return (moment.now() / 1000).toString()
}
