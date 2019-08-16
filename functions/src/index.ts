import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Types
import { TData, TMeasurement } from './types'

// Utility
import { isToday, getCurrentTime } from './utility'

//----------------------------------------------------
admin.initializeApp()
const MAX_LOG_COUNT = 3000

//----------------------------------------------------
export const onDataUpdate = functions.database
  .ref('/data/{deviceID}')
  .onUpdate((change, context) => {
    const deviceID = context.params.deviceID
    const after: TData = change.after.val()

    console.log('Durchlauf zum Zeitpunkt ' + getCurrentTime() + ': ', {
      deviceID: deviceID,
      afterObject: after,
      isToday: isToday(after.lastUpdated)
    })

    if (isToday(after.lastUpdated)) return updateHistory(deviceID, after)
    else return change.after.ref.update({ lastUpdated: getCurrentTime() })
  })

//--------------------------------------------------------
const updateHistory = async (deviceID: string, after: TData) => {
  switch (after.type) {
    case 'sensor':
      return updateSensor(deviceID, after.lastUpdated, after.values)
    default:
      return
  }
}

//--------------------------------------------------------
const updateSensor = async (deviceID: string, timestamp: string, values: any) => {
  return admin
    .database()
    .ref('/history/' + deviceID)
    .once('value')
    .then(snapshot => {
      let newDeviceHistory: any = {}
      if (snapshot.hasChildren()) {
        // History for the Device already exists
        const oldDeviceHistory = snapshot.val()
        Object.keys(values).forEach((key: string) => {
          const historyForKey: Array<TMeasurement> = oldDeviceHistory[key]

          if (historyForKey.length > MAX_LOG_COUNT) historyForKey.splice(0, historyForKey.length)

          historyForKey.push({ timestamp: timestamp, value: values[key] })
          newDeviceHistory = { ...newDeviceHistory, [key]: historyForKey }
        })
      } else {
        // No History logged for the device yet
        Object.keys(values).forEach((key: string) => {
          newDeviceHistory = {
            ...newDeviceHistory,
            [key]: [{ timestamp: timestamp, value: values[key] }]
          }
        })
      }

      console.log('New Device-History after Adding: ', newDeviceHistory)
      return snapshot.ref.update(newDeviceHistory)
    })
}
