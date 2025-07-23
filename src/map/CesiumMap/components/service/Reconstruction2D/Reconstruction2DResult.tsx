import TiffWMTSLoader4326 from '../common/TiffWMTSLoader4326'

type PropsType = {
  data: API_RECONSTRUCTION.Reconstruction2DListItem
}

const Reconstruction2DResultItem: FC<PropsType> = memo(({ data }) => {
  if (
    !data.bboxMinX ||
    !data.bboxMinY ||
    !data.bboxMaxX ||
    !data.bboxMaxY ||
    !data.layer
  ) {
    return null
  }

  return (
    <TiffWMTSLoader4326
      layer={data.layer}
      bboxMinX={parseFloat(data.bboxMinX)}
      bboxMinY={parseFloat(data.bboxMinY)}
      bboxMaxX={parseFloat(data.bboxMaxX)}
      bboxMaxY={parseFloat(data.bboxMaxY)}
    />
  )
})

Reconstruction2DResultItem.displayName = 'Reconstruction2DResultItem'

export default Reconstruction2DResultItem
