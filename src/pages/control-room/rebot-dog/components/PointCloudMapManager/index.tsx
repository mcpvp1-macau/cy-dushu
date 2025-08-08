import { FC } from 'react'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { useState } from 'react'
import clsx from 'clsx'

const PointCloudMapManager: FC = () => {
  const activeMapUrl = useRebotDogControlRoomStore((s) => s.activeMapUrl)
  const updateActiveMapUrl = useRebotDogControlRoomStore(
    (s) => s.updateActiveMapUrl,
  )
  const [data, setData] = useState<any>([
    {
      id: 1,
      url: '/pcd_data/lab_avia.pcd',
      name: 'lab_avia.pcd',
    },
    {
      id: 2,
      url: '/pcd_data/lab_mid360.pcd',
      name: 'lab_mid360.pcd',
    },
    {
      id: 3,
      url: '/pcd_data/output_ascii_deskewed.pcd',
      name: 'output_ascii_deskewed.pcd',
    },
    {
      id: 4,
      url: '/pcd_data/output.pcd',
      name: 'output.pcd',
    },
    {
      id: 5,
      url: '/pcd_data/room_scan1.pcd',
      name: 'room_scan1.pcd',
    },
  ])
  return (
    <div className="h-full w-full p-3 flex flex-col gap-2">
      {data.map((item: any) => (
        <div
          key={item.id}
          className={clsx(
            'border border-gray-700 rounded-md p-2 cursor-pointer hover:bg-gray-700',
            activeMapUrl === item.url && 'bg-gray-700',
          )}
          onClick={() => {
            updateActiveMapUrl(item.url)
          }}
        >
          {item.name}
        </div>
      ))}
    </div>
  )
}

export default PointCloudMapManager
