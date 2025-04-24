import DataCollapse from '../../components/DataCollapse'
import UsePrevDayHisTrack from '../../components/PrevDayHisTrack'

const RebotDogDetailData: FC<unknown> = memo(() => {
  return (
    <>
      <DataCollapse />
      <UsePrevDayHisTrack />
    </>
  )
})

RebotDogDetailData.displayName = 'RebotDogDetailData'

export default RebotDogDetailData
