import DynamicLayoutRoot from '@/components/DynamicLayout'

type PropsType = unknown

const Thing: FC<PropsType> = () => {
  return (
    <div className="w-[600px] h-[400px]">
      <DynamicLayoutRoot
        layout={{
          type: 'row',
          size: 1,
          children: [
            {
              type: 'tabs',
              size: 300,
              children: [
                {
                  key: '1',
                },
              ],
            },
            {
              type: 'col',
              size: 400,
              children: [
                {
                  type: 'tabs',
                  size: 400,
                  children: [
                    {
                      key: '2',
                    },
                  ],
                },
                {
                  type: 'tabs',
                  size: 600,
                  children: [
                    {
                      key: '3',
                    },
                  ],
                },
              ],
            },
          ],
        }}
      />
    </div>
  )
}

export default Thing
