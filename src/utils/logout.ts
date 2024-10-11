/** 退出登录 */
const logout = () => {
  const { loginUrl, systemName } = globalConfig
  window.location.href = `${loginUrl}?systemName=${systemName}&fallback=${
    window.location.href.split("?")?.[0]
  }`
}

export default logout
