import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Types
import { TData, TMeasurement } from './types'

//----------------------------------------------------
admin.initializeApp()

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

const updateSensor = (deviceID: string, timestamp: string, values: any) => {
  return admin
    .database()
    .ref('/history')
    .once('value')
    .then(snapshot => {
      if (snapshot.hasChild(deviceID)) {
        const deviceHistory = snapshot.child(deviceID).val()
        console.log('Device History: ', deviceHistory)

        let newDeviceHistory: any = {}
        Object.keys(values).forEach((key: string) => {
          console.log('Current Key: ', key)
          const historyForKey: Array<TMeasurement> = deviceHistory.child(key).val()
          console.log('History for Key: ', historyForKey)

          historyForKey.push({ timestamp: timestamp, value: values[key] })
          newDeviceHistory = { ...newDeviceHistory, key: historyForKey }
        })

        console.log('New Device-History after Adding: ', newDeviceHistory)
        return snapshot.ref.child(deviceID).update(newDeviceHistory)
      } else {
        let newDeviceHistory: any = {}
        Object.keys(values).forEach((key: string) => {
          console.log('Current Key: ', key)

          newDeviceHistory = {
            ...newDeviceHistory,
            key: [{ timestamp: timestamp, value: values[key] }]
          }
        })

        console.log('New Device-History after Adding: ', newDeviceHistory)
        return snapshot.ref.child(deviceID).set(newDeviceHistory)
      }
    })
}
