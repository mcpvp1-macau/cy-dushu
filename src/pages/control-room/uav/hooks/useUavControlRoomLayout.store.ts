import { DynamicLayoutType } from '@/components/DynamicLayout'
import { DynamicLayoutTabsType } from '@/components/DynamicLayout/components/DynamicLayoutTabs'
import { RightModeEnum } from '@/enum/right-mode'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const initialLayout: DynamicLayoutType = {
  type: 'row',
  size: 1,
  children: [
    {
      type: 'tabs',
      size: 600,
      children: [
        {
          key: 'map',
        },
      ],
    },
    {
      type: 'col',
      size: 800,
      children: [
        {
          type: 'tabs',
          size: 3,
          children: [
            {
              key: 'video',
            },
          ],
        },
        {
          type: 'row',
          size: 1,
          children: [
            {
              type: 'tabs',
              size: 3,
              children: [
                {
                  key: 'flyParams',
                },
              ],
            },
            {
              type: 'tabs',
              size: 3,
              children: [
                {
                  key: 'flyButtons',
                },
                {
                  key: 'flyParamsSetting',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'tabs',
      size: 350,
      isCollapsed: true,
      children: [
        {
          key: 'payload',
        },
        {
          key: 'ai-list',
        },
        {
          key: 'device-data',
        },
        {
          key: 'tanqi',
        },
      ],
    },
  ],
}

type StateType = {
  layout: DynamicLayoutType
  overlayDetailId: string | null
  eventId: string | null
  mapRight: RightModeEnum | null
}

type ActionsType = {
  updateLayout: (layout: StateType['layout']) => void
  updateOverlayDetailId: (id: StateType['overlayDetailId']) => void
  updateEventId: (id: StateType['eventId']) => void
  updateMapRight: (right: StateType['mapRight']) => void
  /** 在 某个 refKey 后追加新面板 */
  activeOrAppendTabAfterTab: (
    tab: DynamicLayoutTabsType[number],
    refKey?: string,
  ) => void
}

/** 无人机驾驶舱灵动布局 */
export const useUavControlRoomLayoutStore = create<StateType & ActionsType>()(
  persist(
    (set, get) => ({
      layout: initialLayout,
      overlayDetailId: null,
      eventId: null,
      mapRight: null,
      updateLayout: (layout) => set({ layout }),
      updateOverlayDetailId: (id) => set({ overlayDetailId: id }),
      updateEventId: (id) => set({ eventId: id }),
      updateMapRight: (right) => set({ mapRight: right }),
      activeOrAppendTabAfterTab: (tab, refKey = 'device-data') => {
        const newLayout = { ...get().layout }
        let found = false

        // 尝试寻找原本是否就存在
        let updateLayoutNode = (node: DynamicLayoutType) => {
          if (node.type === 'tabs') {
            const overlayIndex = node.children.findIndex(
              (t) => t.key === tab.key,
            )
            console.log('overlayIndex', overlayIndex)
            if (overlayIndex >= 0) {
              node.children = [
                ...node.children.slice(0, overlayIndex),
                tab,
                ...node.children.slice(overlayIndex + 1),
              ]
              found = true
              node.activeKey = tab.key
              node.isCollapsed = false
              node.size = Math.max(node.size, 350)
              return
            }
            return
          }
          if (found) {
            return
          }
          let i = 0
          for (const child of node.children) {
            updateLayoutNode(child)
            if (found) {
              node.children = [
                ...node.children.slice(0, i),
                { ...child },
                ...node.children.slice(i + 1),
              ]
              return
            }
            i++
          }
        }
        updateLayoutNode(newLayout)

        console.log('found', found)
        // 没找到就添加到指定的 key 后面
        if (!found) {
          updateLayoutNode = (node: DynamicLayoutType) => {
            if (node.type === 'tabs') {
              const overlayIndex = node.children.findIndex(
                (t) => t.key === refKey,
              )
              if (overlayIndex >= 0) {
                node.children = [...node.children, tab]
                found = true
                node.activeKey = tab.key
                node.isCollapsed = false
                node.size = Math.max(node.size, 350)
                return
              }
              return
            }
            if (found) {
              return
            }
            let i = 0
            for (const child of node.children) {
              updateLayoutNode(child)
              if (found) {
                node.children = [
                  ...node.children.slice(0, i),
                  { ...child },
                  ...node.children.slice(i + 1),
                ]
                return
              }
              i++
            }
          }
          updateLayoutNode(newLayout)
        }

        set({ layout: newLayout })
      },
    }),
    {
      name: 'uavControlRoomLayout',
      version: 2,
    },
  ),
)
