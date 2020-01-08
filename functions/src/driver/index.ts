import * as admin from 'firebase-admin'

// Types
import { TDevice, TMeasurement } from '../types'

// Consts
const MAX_LOG_COUNT = 300

//--------------------------------------------------------
export const updateHistory = async (deviceID: string, after: TDevice) => {
  switch (after.type) {
    case 'sensor':
      return updateSensor(deviceID, after.lastUpdated, { battery: after.battery, ...after.values })
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

          if (dataForKey.length > MAX_LOG_COUNT) dataForKey.splice(0, 1)

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

      return snapshot.ref.update(newDeviceData)
    })
}
