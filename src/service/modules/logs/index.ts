import server4A from '@/service/servers/server4A'

/** 向 4A 发送日志 */
export const postServerLog = (
  level: 'info' | 'error' | 'warn' | 'debug',
  message: string,
) => {
  return server4A.post(`/log/${globalConfig.systemName}/${level}`, message, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
