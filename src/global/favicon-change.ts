// effect: change favicon based on theme
function setFavicon(theme) {
  const favicon = document.getElementById('favicon')
  if (!favicon || !(favicon instanceof HTMLLinkElement)) {
    return
  }
  if (theme === 'dark') {
    favicon.href = (window as any)?.config?.logo ?? '/favicon-dark.svg'
  } else {
    favicon.href = (window as any)?.config?.logo ?? '/favicon.svg'
  }
}
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
setFavicon(mediaQuery.matches ? 'dark' : 'light')
mediaQuery.addEventListener('change', (e) => {
  setFavicon(e.matches ? 'dark' : 'light')
})
