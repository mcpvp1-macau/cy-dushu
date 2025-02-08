import { DynamicLayoutType } from '@/components/DynamicLayout'
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
      ],
    },
  ],
}

type StateType = {
  layout: DynamicLayoutType
  overlayDetailId: string | null
  mapRight: RightModeEnum | null
}

type ActionsType = {
  updateLayout: (layout: StateType['layout']) => void
  updateOverlayDetailId: (id: StateType['overlayDetailId']) => void
  updateMapRight: (right: StateType['mapRight']) => void
}

/** 无人机驾驶舱灵动布局 */
export const useUavControlRoomLayoutStore = create<StateType & ActionsType>()(
  persist(
    (set) => ({
      layout: initialLayout,
      overlayDetailId: null,
      mapRight: null,
      updateLayout: (layout) => set({ layout }),
      updateOverlayDetailId: (id) => set({ overlayDetailId: id }),
      updateMapRight: (right) => set({ mapRight: right }),
    }),
    {
      name: 'uavControlRoomLayoutV2',
    },
  ),
)
