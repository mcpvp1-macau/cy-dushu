import protobuf from 'protobufjs'
import { useEffect, useRef } from 'react'

const usePropertiesProtobuf = (callback?: (data: any) => void) => {
  const propertiesProto = useRef<protobuf.Root | null>(null)
  const propertiesType = useRef<protobuf.Type | null>(null)

  useEffect(() => {
    protobuf.load('/protos/properties.proto', (err, root) => {
      if (root) {
        propertiesProto.current = root
        propertiesType.current = root.lookupType('ja.PropertiesData')
      }
    })
  }, [])

  const handlePropertiesProtobuf = (array: Uint8Array) => {
    if (!propertiesType.current) {
      return
    }
    const data = propertiesType.current.decode(array)
    callback?.(data)
  }

  return {
    propertiesProto: propertiesProto.current,
    handlePropertiesProtobuf,
  }
}

export default usePropertiesProtobuf
