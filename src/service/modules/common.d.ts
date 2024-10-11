declare namespace API_COMMON {
  type PageParam = Partial<{
    isPage: boolean
    page: number
    size: number
  }>

  type PageRes<T> = {
    rows: T[]
    total: number
  }
}
