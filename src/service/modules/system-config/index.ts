import server4A from '@/service/servers/server4A'
import useUserStore from '@/store/useUser.store'

/** 获取系统教程 */
export const getSystemTutorials = () => {
  return server4A.get<{
    tutorials: string[]
    videos: string[]
  }>(`/system-tutorials/${globalConfig.systemName}`)
}

export const uploadSystemTutorial = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const { token } = useUserStore.getState()
  const resp = await fetch(
    `/proxyApi/system-tutorials/${globalConfig.systemName}/upload`,
    {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        _origin_target_host: location.host,
      },
    },
  )
  return resp
}

/** 删除系统教程 */
export const deleteSystemTutorial = async (
  filename: string,
  dirname: string,
) => {
  return server4A.delete(
    `/system-tutorials/${globalConfig.systemName}/${dirname}/${filename}`,
  )
}
