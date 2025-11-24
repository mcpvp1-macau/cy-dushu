import serverHumanLoop from '@/service/servers/serverHumanLoop'

export const humanAnswer = (data: {
  configurable: { thread_id: 'string' }
  resume: any
}) => {
  return serverHumanLoop.post('/v1/human/answer', data)
}
