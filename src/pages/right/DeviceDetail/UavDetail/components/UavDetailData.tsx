import UsePrevDayHisTrack from '../../components/PrevDayHisTrack'
import DataCollapse from '../../components/DataCollapse'

type PropsType = {}

const UavDetailData: FC<PropsType> = memo(() => {
  return (
    <>
      <DataCollapse />
      <UsePrevDayHisTrack />
    </>
  )
})

UavDetailData.displayName = 'UavDetailData'

export default UavDetailData
