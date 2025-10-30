import serverFlight3D from '@/service/servers/serverFlight3D'

export const calcFlight3DRoute = (data: {
  points: { lon: number; lat: number; alt: number }[]
  resolution: number
  safedist: number
}) => {
  return serverFlight3D.post('plan_paths', data)
}
