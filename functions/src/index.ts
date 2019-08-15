import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Types
import { TData, TMeasurement } from './types'

//----------------------------------------------------
admin.initializeApp()
const MAX_LOG_COUNT = 8600

//----------------------------------------------------
export const onDataUpdate = functions.database
  .ref('/data/{deviceID}')
  .onUpdate((change, context) => {
    const deviceID = context.params.deviceID
    const after: TData = change.after.val()

    console.log('Change happened to Device with ID: ', deviceID)
    console.log('After Object: ', after)

    switch (after.type) {
      case 'sensor':
        return updateSensor(deviceID, after.lastUpdated, after.values)
      default:
        return
    }
  })

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
        console.log('Device History: ', oldDeviceHistory)

        Object.keys(values).forEach((key: string) => {
          const historyForKey: Array<TMeasurement> = oldDeviceHistory[key]
          console.log(`History for ${key}: `, historyForKey)

          if (historyForKey.length > MAX_LOG_COUNT) historyForKey.splice(0, historyForKey.length)

          historyForKey.push({ timestamp: timestamp, value: values[key] })
          newDeviceHistory = { ...newDeviceHistory, [key]: historyForKey }
        })
      } else {
        // no History logged for the device
        Object.keys(values).forEach((key: string) => {
          console.log('Current Key: ', key)

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
