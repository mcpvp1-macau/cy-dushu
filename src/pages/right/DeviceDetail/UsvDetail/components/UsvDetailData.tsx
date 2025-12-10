import DataCollapse from '../../components/DataCollapse'
import UsePrevDayHisTrack from '../../components/PrevDayHisTrack'

const UsvDetailData: FC = memo(() => {
  return (
    <>
      <DataCollapse />
      <UsePrevDayHisTrack />
    </>
  )
})

UsvDetailData.displayName = 'UsvDetailData'

export default UsvDetailData
