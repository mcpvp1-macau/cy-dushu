import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type ThemeSetting = 'light' | 'dark' | 'system' | 'jh-police'
type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'theme-mode'

const preferSystemTheme = (): ResolvedTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const applyThemeToDom = (theme: ResolvedTheme) => {
  document.documentElement.setAttribute('data-theme', theme)
}

type State = {
  /** 当前设置的主题色 */
  mode: ThemeSetting
  /** 组件库算法主题 */
  resolvedTheme: ResolvedTheme
}

type Actions = {
  init: () => void
  setMode: (mode: ThemeSetting) => void
  applySystemPreference: () => void
}

const useThemeStore = create<State & Actions>()(
  devtools(
    (set, get) => ({
      mode: globalConfig.defaultTheme as ThemeSetting,
      resolvedTheme: 'dark',
      init: () => {
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeSetting | null
        const mode = saved ?? (globalConfig.defaultTheme as ThemeSetting)
        const resolvedTheme =
          mode === 'system' ? preferSystemTheme() : (mode as ResolvedTheme)
        applyThemeToDom(resolvedTheme)
        set({ mode, resolvedTheme }, false, 'theme/init')
      },
      setMode: (mode) => {
        const resolvedTheme =
          mode === 'system' ? preferSystemTheme() : (mode as ResolvedTheme)
        localStorage.setItem(STORAGE_KEY, mode)
        applyThemeToDom(resolvedTheme)
        set({ mode, resolvedTheme }, false, 'theme/setMode')
      },
      applySystemPreference: () => {
        const { mode, resolvedTheme } = get()
        if (mode !== 'system') {
          return
        }
        const next = preferSystemTheme()
        if (next === resolvedTheme) {
          return
        }
        applyThemeToDom(next)
        set({ resolvedTheme: next }, false, 'theme/applySystemPreference')
      },
    }),
    {
      name: 'theme-store',
    },
  ),
)

export default useThemeStore
export type { ThemeSetting, ResolvedTheme }
