import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Types
import { TDevice } from './types'

// Driver
import { updateHistory } from './driver'

// Utility
import { isToday, getCurrentTime } from './utility'

//----------------------------------------------------
admin.initializeApp()

//----------------------------------------------------
export const onDataUpdate = functions.database
  .ref('/devices/{deviceID}')
  .onUpdate((change, context) => {
    // Monitor Execution Time Start
    const hrstart = process.hrtime()

    // Setup
    const deviceID = context.params.deviceID
    const after: TDevice = change.after.val()

    // Execute
    isToday(after.lastUpdated)
      ? updateHistory(deviceID, after)
      : change.after.ref.update({ lastUpdated: getCurrentTime() })

    // Logging
    const hrend = process.hrtime(hrstart)
    console.info(
      `Execution (Timestamp: ${getCurrentTime()}) for Device ${
        after.name
      } (ID: ${deviceID}) took ${`${hrend[0]}s and ${hrend[1] / 1000000}ms`}.`
    )

    return 0
  })
