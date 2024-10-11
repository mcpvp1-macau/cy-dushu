import AutoImport from 'unplugin-auto-import/vite'

export default AutoImport({
  include: [
    /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
  ],
  imports: [
    {
      from: 'react',
      imports: [
        'memo',
        'useState',
        'useEffect',
        'useMemo',
        'useContext',
        'useRef',
      ],
    },
    {
      from: 'react',
      imports: ['FC', 'ReactNode'],
      type: true,
    },
    {
      from: 'ahooks',
      imports: ['useMemoizedFn', 'useBoolean'],
    },
    {
      from: 'localforage',
      imports: [['*', 'local']],
    },
    'react-router',
    {
      from: '@tanstack/react-query',
      imports: ['useQuery', 'useMutation', 'useQueryClient'],
    },
    {
      clsx: [['default', 'clsx']],
    },
    {
      '@/global/config': [['default', 'globalConfig']],
    },
    {
      '@/utils/pkg-transport': [['dayjs', 'dayjs']],
    },
  ],
  // dirs: ["src/global"],
  eslintrc: {
    enabled: true,
  },
})
