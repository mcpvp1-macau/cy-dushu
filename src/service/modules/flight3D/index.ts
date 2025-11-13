import serverFlight3D from '@/service/servers/serverFlight3D'

export const calcFlight3DRoute = (data: {
  points: { lon: number; lat: number; alt: number }[]
  region: string
  maxsamples: number
}) => {
  return serverFlight3D.post('plan_paths', data)
}
