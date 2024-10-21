import serverJingqi from '@/service/servers/serverJingqi'

/** 获取人员组织树 */
export const getPersonTree = () => {
  return serverJingqi.post<API_PERSON.domain.PersonTreeItem[]>(
    '/actionPerson/list/v2',
    {},
  )
}
