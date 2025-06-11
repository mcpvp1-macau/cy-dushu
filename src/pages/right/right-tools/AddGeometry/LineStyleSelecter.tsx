import { Tooltip } from 'antd'
import { Flex, Select } from 'antd'
import React from 'react'
import IconLine from '@/assets/icons/jsx/IconLine'
import IconDashedLine from '@/assets/icons/jsx/IconDashedLine'

type PropsType = {
  lineStyle: 'solid' | 'dashed'
  onChange: (dash: 'solid' | 'dashed') => void
}

const LineStyleSelecter: React.FC<PropsType> = (props) => {
  const { lineStyle, onChange } = props

  const [selectedStyle, setSelectedStyle] = useState(lineStyle)
  useEffect(() => {
    setSelectedStyle(lineStyle)
    onChange(lineStyle)
  }, [lineStyle])

  return (
    <Flex gap={6}>
      <Flex align="center">
        <div>虚实：</div>
        <div className="flex items-cente w-[80px]">
          <Select
            options={[
              {
                label: (
                  <Tooltip title="实线">
                    <IconLine className="text-[30px]" />
                  </Tooltip>
                ),
                value: 'solid',
              },
              {
                label: (
                  <Tooltip title="虚线">
                    <IconDashedLine className="text-[30px]" />
                  </Tooltip>
                ),
                value: 'dashed',
              },
              // {
              //   label: (
              //     <Tooltip title="禁飞区">
              //       <IconLine className="text-[30px]" />
              //     </Tooltip>
              //   ),
              //   value: 'no-fly',
              // },
            ]}
            defaultValue={'solid'}
            size="small"
            value={selectedStyle}
            onChange={(val) => {
              setSelectedStyle(val as 'solid' | 'dashed')
              onChange(val as 'solid' | 'dashed')
            }}
          />
        </div>
      </Flex>
    </Flex>
  )
}

LineStyleSelecter.displayName = 'DashSolid'

export default React.memo(LineStyleSelecter)
