export type TDevice = {
  id: string
  name: string
  lastUpdated: string
  battery: number
  type: string
  values: any
}

export type TMeasurement = {
  timestamp: string
  value: string
}
