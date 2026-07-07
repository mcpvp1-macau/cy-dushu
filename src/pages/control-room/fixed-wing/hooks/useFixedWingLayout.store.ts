import { DynamicLayoutType } from '@/components/DynamicLayout'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** 固定翼驾驶舱默认布局（与无人机驾驶舱保持一致的结构: 左地图 / 中视频+底部操作 / 右侧页签） */
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
                  key: 'control',
                },
              ],
            },
            {
              type: 'tabs',
              size: 3,
              children: [
                {
                  key: 'operation',
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
      children: [
        {
          key: 'payload',
          keeyRenderOnHidden: false,
        },
        {
          key: 'algorithm',
          keeyRenderOnHidden: false,
        },
        {
          key: 'device-data',
          keeyRenderOnHidden: false,
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
}

type ActionsType = {
  updateLayout: (layout: StateType['layout']) => void
}

/** 固定翼驾驶舱灵动布局 */
export const useFixedWingLayoutStore = create<StateType & ActionsType>()(
  persist(
    (set) => ({
      layout: initialLayout,
      updateLayout: (layout) => set({ layout }),
    }),
    {
      name: 'fixedWingControlRoomLayout',
      version: 2,
    },
  ),
)
