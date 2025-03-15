import DataCollapse from '../../components/DataCollapse'
import useIsRightDetail from '../../hooks/useIsRightDetail'
import UsePrevDayHisTrack from '../../components/PrevDayHisTrack'

const RebotDogDetailData: FC<unknown> = memo(() => {
  const isRightDetail = useIsRightDetail()

  return (
    <>
      <DataCollapse />
      {isRightDetail && <UsePrevDayHisTrack />}
    </>
  )
})

RebotDogDetailData.displayName = 'RebotDogDetailData'

export default RebotDogDetailData
