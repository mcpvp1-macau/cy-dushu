import { CaretDownFilled } from '@ant-design/icons'
import { Select as ASelect } from 'antd'

const BSelect = (props) => {
  return (
    <ASelect
      suffixIcon={<CaretDownFilled style={{ pointerEvents: 'none' }} />}
      {...props}
    />
  )
}

const Select = BSelect as unknown as typeof ASelect

export default Select
