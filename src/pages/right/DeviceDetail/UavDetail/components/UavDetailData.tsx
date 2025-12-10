import UsePrevDayHisTrack from '../../components/PrevDayHisTrack'
import DataCollapse from '../../components/DataCollapse'

type PropsType = Record<string, never>

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
