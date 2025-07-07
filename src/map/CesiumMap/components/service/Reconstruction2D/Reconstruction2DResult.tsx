import TiffLoader32650 from '../common/TiffLoader32650'

type PropsType = {
  data: API_RECONSTRUCTION.Reconstruction2DListItem
}

const Reconstruction2DResultItem: FC<PropsType> = memo(({ data }) => {
  return <TiffLoader32650 url={data.imageUrl} />
})

Reconstruction2DResultItem.displayName = 'Reconstruction2DResultItem'

export default Reconstruction2DResultItem
