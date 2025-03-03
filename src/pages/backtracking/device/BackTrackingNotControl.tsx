import Icon from '@/components/Icon'

const BackTrackingNotControl: React.FC = memo(() => {
  return (
    <div className="w-full h-full flex items-center justify-center gap-2">
      <div>
        <Icon id="icon-lishi" className='text-[20px] text-amber-300' />
      </div>
      <div className='text-[12px]'>
        <div className="flex gap-2 leading-4">回溯中!</div>
        <p>控制功能禁用!</p>
      </div>
    </div>
  )
})

export default BackTrackingNotControl
