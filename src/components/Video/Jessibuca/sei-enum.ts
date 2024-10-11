import { AIData } from './sei-types/ai-data'
import { PropertiesData } from './sei-types/properties'

enum SeiEnum {
  TEXT = 0x00,
  JSON_SEI = 0x01,
  Protobuf_SEI = 0x02,
  JSON_PROPERTIES = 0x03,
  PROTOBUF_PROPERTIES = 0x04,
  JSON_AR = 0x05,
  PROTOBUF_AR = 0x06,
}

export type SEI_TYPE = {
  [SeiEnum.PROTOBUF_PROPERTIES]: PropertiesData
  [SeiEnum.Protobuf_SEI]: AIData
  [SeiEnum.TEXT]: any
  [SeiEnum.JSON_SEI]: any
  [SeiEnum.JSON_PROPERTIES]: any
  [SeiEnum.PROTOBUF_AR]: any
  [SeiEnum.JSON_AR]: any
}

export default SeiEnum
