import UsePrevDayHisTrack from '../../components/PrevDayHisTrack'
import useIsRightDetail from '../../hooks/useIsRightDetail'
import DataCollapse from '../../components/DataCollapse'

type PropsType = {}

const UavDetailData: FC<PropsType> = memo(() => {
  const isRightDetail = useIsRightDetail()

  return (
    <>
      <DataCollapse />
      {isRightDetail && <UsePrevDayHisTrack />}
    </>
  )
})

UavDetailData.displayName = 'UavDetailData'

export default UavDetailData
