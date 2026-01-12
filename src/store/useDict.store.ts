import { emtpyObject } from '@/constant/data'
import { DictEnum } from '@/enum/dict'
import { getControlCenterDictList, getDictList } from '@/service/modules/dict'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  dict: Record<string, Record<string, API_DICT.domain.DictRecord>> | null
  langsDict: Record<string, Record<string, Record<string, string | undefined>>>
}

type ActionsType = {
  updateDict: (newDict: StateType['dict']) => void
  updateLangsDict: (newDict: StateType['langsDict']) => void
}

/** 字典信息 */
const useDictStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      dict: null,
      langsDict: {},
      updateDict: async (newDict) => {
        set({ dict: newDict }, false, 'updateDict')
      },
      updateLangsDict: async (newDict) => {
        set({ langsDict: newDict }, false, 'updateLangsDict')
      },
    }),
    {
      name: 'dict',
      enabled: import.meta.env.DEV,
    },
  ),
)

// 获取指定字典组的选项列表。
export const useDictOptions = (dictGroup: DictEnum) => {
  const queryClient = useQueryClient()
  const { data } = useQuery(
    {
      queryKey: ['dict'],
      queryFn: () => getDictList(),
      staleTime: Infinity,
      select: (d) => d.data,
    },
    queryClient,
  )

  useEffect(() => {
    if (!data) {
      return
    }
    const newDict: StateType['dict'] = {}
    for (const item of data) {
      newDict[item.dictGroup] = {
        ...newDict[item.dictGroup],
        [item.dictKey]: item,
      }
    }
    useDictStore.getState().updateDict(newDict)
  }, [data])

  const dict = useDictStore((state) => state.dict)

  const actionTypeFilters = globalConfig.actionTypeFilters ?? []

  return useMemo(() => {
    const options = Object.values(dict?.[dictGroup] || {})
      .sort((a, b) => a.orderWeight - b.orderWeight)
      .map((item) => ({
        label: item.dictName,
        value: item.dictKey,
      }))

    if (dictGroup !== DictEnum.ACTION_TYPE || actionTypeFilters.length === 0) {
      return options
    }

    // 业务规则：行动类型字典需要过滤配置中的类型。
    return options.filter((item) => !actionTypeFilters.includes(item.value))
  }, [dict, dictGroup, actionTypeFilters])
}

/** 国际化相关的字典 */
export const useLangsDict = (type: string) => {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  const { data } = useQuery(
    {
      queryKey: ['langsDict'],
      queryFn: () => getControlCenterDictList(),
      staleTime: Infinity,
      select: (d) => d.data,
    },
    queryClient,
  )

  useEffect(() => {
    if (!data) {
      return
    }
    const newDict: StateType['langsDict'] = {
      zh: {},
      en: {},
    }
    for (const item of data) {
      if (!newDict['zh'][item.type]) {
        newDict['zh'][item.type] = {}
      }
      if (!newDict['en'][item.type]) {
        newDict['en'][item.type] = {}
      }
      newDict['zh'][item.type][item.code] = item.msgZhCn
      newDict['en'][item.type][item.code] = item.msgEnUs
    }
    useDictStore.getState().updateLangsDict(newDict)
  }, [data])

  return useDictStore(
    (state) => state.langsDict[i18n.language]?.[type] ?? emtpyObject,
  )
}

export default useDictStore
