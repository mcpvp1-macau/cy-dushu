import { memo, type FC } from 'react'
import CloseableHeader from '../components/CloseableHeader'
import IconAddMark from '@/assets/icons/jsx/right-tools/IconAddMark'
import AppCollapse from '@/components/AppCollapse'
import useMapDrawStore, { DrawType } from '@/store/map/useDraw.store'
import { useUnmount } from 'ahooks'
import { CameraOutlined } from '@ant-design/icons'

type PropsType = {
  onClose?: () => void
}

const presetColors = [
  '#ffffff',
  '#000000',
  '#64748b',
  '#6b7280',
  '#71717a',
  '#737373',
  '#78716c',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
]

const presetMarkers = [
  // green
  { icon: '/images/overlay/icon/Bjundui.svg', label: 'Bjundui', color: 'green', index: 1 },
  { icon: '/images/overlay/icon/binanchangsuo.svg', label: 'binanchangsuo', color: 'green', index: 2 },
  { icon: '/images/overlay/icon/jikongzhongxin.svg', label: 'jikongzhongxin', color: 'green', index: 3 },
  { icon: '/images/overlay/icon/jiuyuancheliang.svg', label: 'jiuyuancheliang', color: 'green', index: 4 },
  { icon: '/images/overlay/icon/jiuyuandui.svg', label: 'jiuyuandui', color: 'green', index: 5 },
  { icon: '/images/overlay/icon/renminjingcha.svg', label: 'renminjingcha', color: 'green', index: 6 },
  { icon: '/images/overlay/icon/wujing.svg', label: 'wujing', color: 'green', index: 7 },
  { icon: '/images/overlay/icon/wuzichubeiku.svg', label: 'wuzichubeiku', color: 'green', index: 8 },
  { icon: '/images/overlay/icon/xianchangzhihuibu.svg', label: 'xianchangzhihuibu', color: 'green', index: 9 },
  { icon: '/images/overlay/icon/yiliaojigou.svg', label: 'yiliaojigou', color: 'green', index: 10 },
  { icon: '/images/overlay/icon/yingjilinshijigou.svg', label: 'yingjilinshijigou', color: 'green', index: 11 },
  { icon: '/images/overlay/icon/yunshuchangzhan.svg', label: 'yunshuchangzhan', color: 'green', index: 12 },
  // blue
  { icon: '/images/overlay/icon/dangzhengjiguan.svg', label: 'dangzhengjiguan', color: 'blue', index: 13 },
  { icon: '/images/overlay/icon/dianlijichusheshi.svg', label: 'dianlijichusheshi', color: 'blue', index: 14 },
  { icon: '/images/overlay/icon/gongzhongjujichangsuo.svg', label: 'gongzhongjujichangsuo', color: 'blue', index: 15 },
  { icon: '/images/overlay/icon/jinrongjigou.svg', label: 'jinrongjigou', color: 'blue', index: 16 },
  { icon: '/images/overlay/icon/minhangjiaotongsheshi.svg', label: 'minhangjiaotongsheshi', color: 'blue', index: 17 },
  { icon: '/images/overlay/icon/shiyoutianranqisheshi.svg', label: 'shiyoutianranqisheshi', color: 'blue', index: 18 },
  { icon: '/images/overlay/icon/shuilisheshi.svg', label: 'shuilisheshi', color: 'blue', index: 19 },
  { icon: '/images/overlay/icon/shuiyunjiaotongjichusheshi.svg', label: 'shuiyunjiaotongjichusheshi', color: 'blue', index: 20 },
  { icon: '/images/overlay/icon/tielujichusheshi.svg', label: 'tielujichusheshi', color: 'blue', index: 21 },
  { icon: '/images/overlay/icon/tongxunjichusheshi.svg', label: 'tongxunjichusheshi', color: 'blue', index: 22 },
  { icon: '/images/overlay/icon/xinwenguangbojigou.svg', label: 'xinwenguangbojigou', color: 'blue', index: 23 },
  { icon: '/images/overlay/icon/xuexiao.svg', label: 'xuexiao', color: 'blue', index: 24 },
  { icon: '/images/overlay/icon/zhongyaochangsuo.svg', label: 'zhongyaochangsuo', color: 'blue', index: 25 },
  // yellow
  { icon: '/images/overlay/icon/huanjingwuran1.svg', label: 'huanjingwuran1', color: 'yellow', index: 26 },
  { icon: '/images/overlay/icon/shengchananquan.svg', label: 'shengchananquan', color: 'yellow', index: 27 },
  { icon: '/images/overlay/icon/yunshuanquan.svg', label: 'yunshuanquan', color: 'yellow', index: 28 },
  // red
  { icon: '/images/overlay/icon/caita.svg', label: 'caita', color: 'red', index: 29 },
  { icon: '/images/overlay/icon/caoyuanhuozai.svg', label: 'caoyuanhuozai', color: 'red', index: 30 },
  { icon: '/images/overlay/icon/chengshiguidao.svg', label: 'chengshiguidao', color: 'red', index: 31 },
  { icon: '/images/overlay/icon/chuanranbing.svg', label: 'chuanranbing', color: 'red', index: 32 },
  { icon: '/images/overlay/icon/daolujiaotong.svg', label: 'daolujiaotong', color: 'red', index: 33 },
  { icon: '/images/overlay/icon/dizhenzaihai.svg', label: 'dizhenzaihai', color: 'red', index: 34 },
  { icon: '/images/overlay/icon/dizhizaihai.svg', label: 'dizhizaihai', color: 'red', index: 35 },
  { icon: '/images/overlay/icon/dongwuyiqing.svg', label: 'dongwuyiqing', color: 'red', index: 36 },
  { icon: '/images/overlay/icon/feihangshigu.svg', label: 'feihangshigu', color: 'red', index: 37 },
  { icon: '/images/overlay/icon/fusheshigu.svg', label: 'fusheshigu', color: 'red', index: 38 },
  { icon: '/images/overlay/icon/ganranshijian.svg', label: 'ganranshijian', color: 'red', index: 39 },
  { icon: '/images/overlay/icon/haiyangzaihai.svg', label: 'haiyangzaihai', color: 'red', index: 40 },
  { icon: '/images/overlay/icon/huanjingwuran.svg', label: 'huanjingwuran', color: 'red', index: 41 },
  { icon: '/images/overlay/icon/huozaishigu.svg', label: 'huozaishigu', color: 'red', index: 42 },
  { icon: '/images/overlay/icon/jichusheshi.svg', label: 'jichusheshi', color: 'red', index: 43 },
  { icon: '/images/overlay/icon/jihuishijian.svg', label: 'jihuishijian', color: 'red', index: 44 },
  { icon: '/images/overlay/icon/jinshukuangshan.svg', label: 'jinshukuangshan', color: 'red', index: 45 },
  { icon: '/images/overlay/icon/kongbuxiji.svg', label: 'kongbuxiji', color: 'red', index: 46 },
  { icon: '/images/overlay/icon/meikuangshigu.svg', label: 'meikuangshigu', color: 'red', index: 47 },
  { icon: '/images/overlay/icon/nongyejixie.svg', label: 'nongyejixie', color: 'red', index: 48 },
  { icon: '/images/overlay/icon/qixiangzaihai.svg', label: 'qixiangzaihai', color: 'red', index: 49 },
  { icon: '/images/overlay/icon/senlinhuozai.svg', label: 'senlinhuozai', color: 'red', index: 50 },
  { icon: '/images/overlay/icon/shengxu.svg', label: 'shengxu', color: 'red', index: 51 },
  { icon: '/images/overlay/icon/shigonganquan.svg', label: 'shigonganquan', color: 'red', index: 52 },
  { icon: '/images/overlay/icon/shiyaoanquan.svg', label: 'shiyaoanquan', color: 'red', index: 53 },
  { icon: '/images/overlay/icon/shuihanzaihai.svg', label: 'shuihanzaihai', color: 'red', index: 54 },
  { icon: '/images/overlay/icon/shuishangshigu.svg', label: 'shuishangshigu', color: 'red', index: 55 },
  { icon: '/images/overlay/icon/tezhongshebei.svg', label: 'tezhongshebei', color: 'red', index: 56 },
  { icon: '/images/overlay/icon/tielushigu.svg', label: 'tielushigu', color: 'red', index: 57 },
  { icon: '/images/overlay/icon/weihuapin.svg', label: 'weihuapin', color: 'red', index: 58 },
  { icon: '/images/overlay/icon/xinxianquan.svg', label: 'xinxianquan', color: 'red', index: 59 },
  { icon: '/images/overlay/icon/yanhuabaozhu.svg', label: 'yanhuabaozhu', color: 'red', index: 60 },
]

const AddPoint: FC<PropsType> = memo(({ onClose }) => {
  const { t } = useTranslation()
  const updateDrawing = useMapDrawStore((s) => s.updateDrawing)
  const updateDrawingColor = useMapDrawStore((s) => s.updateDrawingColor)
    const updateDrawingPointIcon = useMapDrawStore(
    (s) => s.updateDrawingPointIcon,
  )

  useUnmount(() => {
    updateDrawing(DrawType.None)
  })

  return (
    <div className="w-[350px]">
      <CloseableHeader onClose={onClose}>
        <div className="flex gap-2 items-center">
          <IconAddMark className="device-detail-icon" />
          <h6 className="text-hightlight text-base">
            {t('overlay.marker.title')}
          </h6>
        </div>
      </CloseableHeader>
      <AppCollapse
        defaultActiveKey={['point']}
        items={[
          {
            key: 'point',
            label: t('overlay.marker.point.title'),
            children: (
              <div className="flex flex-wrap gap-2 gap-x-3.5 m-3">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className="flex items-center gap-2 justify-center hover:bg-ground-5 p-1 rounded-md hover:scale-125 transition-all"
                    onClick={() => {
                      updateDrawing(DrawType.Point)
                      updateDrawingColor(color)
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  </button>
                ))}
              </div>
            ),
          },
                    {
            key: 'marker',
            label: '图标',
            children: (
              <div className="flex flex-wrap gap-2 m-3">
                <button
                  className="flex items-center gap-2 justify-center hover:bg-ground-5 p-1 rounded-md hover:scale-125 transition-all"
                  onClick={() => {
                    updateDrawing(DrawType.Point)
                    updateDrawingPointIcon('take_photo')
                  }}
                >
                  <div className="w-5 h-5 rounded-[4px] border border-gray-300 flex items-center justify-center">
                    <CameraOutlined />
                  </div>
                </button>
                {presetMarkers.map((marker) => (
                  <button
                    key={marker.icon}
                    className="flex items-center gap-2 justify-center hover:bg-ground-5 p-1 rounded-md hover:scale-125 transition-all"
                    onClick={() => {
                      updateDrawing(DrawType.Point)
                      updateDrawingPointIcon(marker.icon)
                    }}
                  >
                    <div
                      className="w-5 h-5 "
                      style={{
                        background: `url(${marker.icon}) no-repeat center/contain`,
                      }}
                    />
                    {/* {marker.index} */}
                  </button>
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
})

AddPoint.displayName = 'AddPoint'

export default AddPoint
