import { Tooltip } from 'antd'
import React from 'react'
import IconLine from '@/assets/icons/jsx/IconLine'
import IconDashedLine from '@/assets/icons/jsx/IconDashedLine'
import IconNoFly from '@/assets/icons/jsx/IconNoFly'
import useMapDrawStore, { LineStyle } from '@/store/map/useDraw.store'
import { useTranslation } from 'react-i18next'
import Select from '@/components/AntdOverride/Select'

type PropsType = {
  showNoFly?: boolean
}

const LineStyleSelecter: FC<PropsType> = ({ showNoFly = false }) => {
  const lineStyle = useMapDrawStore((s) => s.lineStyle)
  const updateLineStyle = useMapDrawStore((s) => s.updateLineStyle)

  const { t } = useTranslation()

  const options = useMemo(() => {
    const options = [
      {
        label: (
          <Tooltip title={t('overlay.drawing.lineStyle.solid')}>
            <IconLine className="text-2xl" />
          </Tooltip>
        ),
        value: 'solid',
      },
      {
        label: (
          <Tooltip title={t('overlay.drawing.lineStyle.dashed')}>
            <IconDashedLine className="text-2xl" />
          </Tooltip>
        ),
        value: 'dashed',
      },
    ]

    if (showNoFly) {
      options.push({
        label: (
          <Tooltip title={t('overlay.drawing.lineStyle.noFly')}>
            <IconNoFly className="text-2xl" />
          </Tooltip>
        ),
        value: 'no-fly',
      })
    }

    return options
  }, [showNoFly])

  return (
    <div className="flex items-center gap-2">
      <div>{t('overlay.drawing.lineStyle.title')}</div>
      <Select
        className="w-16"
        options={options}
        defaultValue={'solid'}
        size="small"
        value={lineStyle}
        onChange={(val) => {
          updateLineStyle(val as LineStyle)
        }}
      />
    </div>
  )
}

LineStyleSelecter.displayName = 'DashSolid'

export default React.memo(LineStyleSelecter)
