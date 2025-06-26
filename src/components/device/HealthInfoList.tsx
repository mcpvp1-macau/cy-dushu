export const HealthInfo: FC<{ data: string }> = memo(({ data }) => {
  if (data.startsWith('Info')) {
    return <li className="bg-blue-600 px-2 rounded">{data.slice(4)}</li>
  }
  if (data.startsWith('Warn')) {
    return <li className="bg-yellow-600 px-2 rounded">{data.slice(4)}</li>
  }
  if (data.startsWith('Error')) {
    return <li className="bg-red-600 px-2 rounded">{data.slice(5)}</li>
  }
  return <li className="bg-neutral-600 px-2 rounded">{data}</li>
})

type PropsType = {
  data: string[]
}

/** 健康信息 */
const HealthInfoList: FC<PropsType> = memo(({ data }) => {
  return (
    <ul className="flex flex-col gap-2 p-3 bg-ground-1 rounded border border-solid border-ground-3">
      {data.map((item) => (
        <HealthInfo key={item} data={item} />
      ))}
    </ul>
  )
})

HealthInfoList.displayName = 'HealthInfoList'

export default HealthInfoList
