import { getPersonTree } from '@/service/modules/person'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  personTree: API_PERSON.domain.PersonTreeItem[] | null
}

type ActionsType = {
  fetchPerson: () => void
}

/** 人员字典信息 */
const usePersonStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      personTree: null,
      fetchPerson: async () => {
        const resp = await getPersonTree()
        set({ personTree: resp.data }, false, 'fetchDict')
      },
    }),
    {
      name: 'dict',
      enabled: import.meta.env.DEV,
    },
  ),
)

export const usePersonTreeOptions = () => {
  const dict = usePersonStore((state) => state.personTree)

  // 懒加载字典数据
  useEffect(() => {
    if (usePersonStore.getState().personTree === null) {
      usePersonStore.getState().fetchPerson()
      usePersonStore.getState().personTree = []
    }
  }, [dict])

  return useMemo(() => {
    const dfs = (data: API_PERSON.domain.PersonTreeItem) => {
      return {
        value: `group-${data.groupId}`,
        label: data.groupName,
        children: [
          ...(data.children ?? []).map(dfs),
          ...(data.users ?? []).map((user) => ({
            value: `user-${user.userId}`,
            label: user.name,
          })),
        ],
      }
    }
    return (dict ?? []).slice(0, 1).map(dfs)
  }, [dict])
}

export default usePersonStore
