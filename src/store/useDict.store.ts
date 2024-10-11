import { DictEnum } from '@/enum/dict'
import { getDictList } from '@/service/modules/dict'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  dict: Record<string, Record<string, API_DICT.domain.DictRecord>> | null
}

type ActionsType = {
  fetchDict: () => void
}

/** 字典信息 */
const useDictStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      dict: null,
      fetchDict: async () => {
        const resp = await getDictList()
        const newDict: StateType['dict'] = {}
        for (const item of resp.data) {
          newDict[item.dictGroup] = {
            ...newDict[item.dictGroup],
            [item.dictKey]: item,
          }
        }
        set({ dict: newDict }, false, 'fetchDict')
      },
    }),
    {
      name: 'dict',
      enabled: import.meta.env.DEV,
    },
  ),
)

export const useDictOptions = (dictGroup: DictEnum) => {
  const dict = useDictStore((state) => state.dict)

  // 懒加载字典数据
  useEffect(() => {
    if (useDictStore.getState().dict === null) {
      useDictStore.getState().fetchDict()
      useDictStore.getState().dict = {}
    }
  }, [dict])

  return useMemo(
    () =>
      Object.values(dict?.[dictGroup] || {})
        .sort((a, b) => a.orderWeight - b.orderWeight)
        .map((item) => ({
          label: item.dictName,
          value: item.dictKey,
        })),
    [dict, dictGroup],
  )
}

export default useDictStore
