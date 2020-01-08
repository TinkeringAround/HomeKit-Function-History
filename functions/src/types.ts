export type TDevice = {
  id: string
  name: string
  lastUpdated: string
  battery: number
  type: TDeviceType
  values: any
}

//--------------------------------------------------------
export type TMeasurement = {
  timestamp: string
  value: string
}

//--------------------------------------------------------
export type TDeviceType = 'sensor'
