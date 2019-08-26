import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Types
import { TDevice, TMeasurement } from './types'

// Utility
import { isToday, getCurrentTime } from './utility'

//----------------------------------------------------
admin.initializeApp()
const MAX_LOG_COUNT = 300

//----------------------------------------------------
export const onDataUpdate = functions.database
  .ref('/devices/{deviceID}')
  .onUpdate((change, context) => {
    const deviceID = context.params.deviceID
    const after: TDevice = change.after.val()

    console.log('Durchlauf zum Zeitpunkt ' + getCurrentTime() + ': ', {
      deviceID: deviceID,
      afterObject: after,
      isToday: isToday(after.lastUpdated)
    })

    if (isToday(after.lastUpdated)) return updateHistory(deviceID, after)
    else return change.after.ref.update({ lastUpdated: getCurrentTime() })
  })

//--------------------------------------------------------
const updateHistory = async (deviceID: string, after: TDevice) => {
  switch (after.type) {
    case 'sensor':
      return updateSensor(deviceID, after.lastUpdated, { battery: after.battery, ...after.values })
    default:
      return
  }
}

//--------------------------------------------------------
const updateSensor = async (deviceID: string, timestamp: string, values: any) => {
  return admin
    .database()
    .ref('/data/' + deviceID)
    .once('value')
    .then(snapshot => {
      let newDeviceData: any = {}
      if (snapshot.hasChildren()) {
        // History for the Device already exists
        const oldData = snapshot.val()
        Object.keys(values).forEach((key: string) => {
          const dataForKey: Array<TMeasurement> = oldData[key]

          if (dataForKey.length > MAX_LOG_COUNT) dataForKey.splice(0, dataForKey.length)

          dataForKey.push({ timestamp: timestamp, value: values[key] })
          newDeviceData = { ...newDeviceData, [key]: dataForKey }
        })
      } else {
        // No History logged for the device yet
        Object.keys(values).forEach((key: string) => {
          newDeviceData = {
            ...newDeviceData,
            [key]: [{ timestamp: timestamp, value: values[key] }]
          }
        })
      }

      console.log('New Device-History after Adding: ', newDeviceData)
      return snapshot.ref.update(newDeviceData)
    })
}
