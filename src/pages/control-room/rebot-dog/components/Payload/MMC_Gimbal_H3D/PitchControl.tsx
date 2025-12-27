import Icon from '@/components/Icon'
import bg from '@/assets/imgs/hanhuaqi-bg.png'
import hanhuaqi from '@/assets/imgs/hanhuaqi.png'
type Props = {
  onClick: (value: number) => void
  value: number
}

const PitchControl: React.FC<Props> = (props) => {
  const { value, onClick } = props
  return (
    <div
      className="flex justify-between w-[130px] pl-[6px] pr-[6px] h-[64px] items-center"
      style={{ backgroundImage: `url(${bg})`, backgroundSize: '100px 64px' }}
    >
      <div
        style={{
          transform: 'rotate(-90deg)',
        }}
        onClick={() => onClick(-5)}
      >
        <Icon
          id="icon-zuozhuan2"
          className="cursor-pointer text-fore hover:text-primary"
        />
      </div>
      <div
        style={{
          transform: `rotate(${90 - value}deg)`,
        }}
        className="w-[50px] h-[50px] "
      >
        {/* <Icon id="icon-direction-left" className="mt-[16px] ml-[25px]" /> */}
        <div
          style={{
            backgroundImage: `url(${hanhuaqi})`,
            backgroundSize: '25px 20px',
            backgroundRepeat: 'no-repeat',
            opacity: 0.8,
          }}
          className="w-[25px] h-[25px] mt-[15px] ml-[25px]"
        ></div>
      </div>
      <div
        style={{
          transform: 'rotate(90deg)',
        }}
        onClick={() => onClick(5)}
      >
        <Icon
          id="icon-zuozhuan2"
          className="cursor-pointer text-fore hover:text-primary"
        />
      </div>
    </div>
  )
}

export default PitchControl
