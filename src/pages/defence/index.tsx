import { Segmented } from 'antd'
import { memo, type FC } from 'react'
import HistoryTable from './components/HistoryTable'
import { isNil } from 'lodash'
import SourceTable from './components/SourceTable'

type PropsType = unknown

const PageSources: FC<PropsType> = memo(() => {
  const [tab, setTab] = useState(1)

  return (
    <div className="page-full p-3 bg-ground-180 flex flex-col overflow-y-hidden">
      <h2 className="text-white">布防</h2>
      <div>
        <Segmented
          className="mt-3"
          value={tab}
          options={[
            {
              label: '布防区域',
              value: 1,
            },
            {
              label: '历史布防',
              value: 2,
            },
          ]}
          onChange={(e) => !isNil(e) && setTab(e)}
        />
      </div>
      {tab === 1 ? <SourceTable /> : <HistoryTable />}
    </div>
  )
})

PageSources.displayName = 'PageSources'

export default PageSources
