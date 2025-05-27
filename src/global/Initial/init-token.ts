import useUserStore from '@/store/useUser.store'

/** 初始化用户令牌 */
const initToken = async () => {
  const param = new URLSearchParams(location.search)
  let token = param.get('token')
  if (token) {
    await local.setItem('token', token)
    param.delete('token')
    history.replaceState(
      null,
      '',
      encodeURIComponent(
        `${location.pathname}${param.size > 0 ? '?' : ''}${param.toString()}`,
      ),
    )
  } else {
    token = await local.getItem('token')
  }
  if (!token) {
    useUserStore.getState().logout()
    return false
  }
  useUserStore.setState({
    token,
  })
  return true
}

export default initToken
