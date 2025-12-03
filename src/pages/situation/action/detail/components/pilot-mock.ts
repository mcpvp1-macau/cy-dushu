export const pilotMock = {
  rows: [
    {
      name: '总公司',
      orgCode: 'ORG-0001',
      parentCode: '',
      pilots: [
        {
          name: '张三',
          userCode: 'U0001',
          orgCode: 'ORG-0001',
          orgName: '总公司',
        },
        {
          name: '李四',
          userCode: 'U0002',
          orgCode: 'ORG-0001',
          orgName: '总公司',
        },
      ],
      children: [
        {
          name: '华东分公司',
          orgCode: 'ORG-0100',
          parentCode: 'ORG-0001',
          pilots: [
            {
              name: '王五',
              userCode: 'U0101',
              orgCode: 'ORG-0100',
              orgName: '华东分公司',
            },
          ],
          children: [
            {
              name: '上海事业部',
              orgCode: 'ORG-0101',
              parentCode: 'ORG-0100',
              pilots: [
                {
                  name: '赵六',
                  userCode: 'U010101',
                  orgCode: 'ORG-0101',
                  orgName: '上海事业部',
                },
              ],
              children: [],
            },
            {
              name: '杭州事业部',
              orgCode: 'ORG-0102',
              parentCode: 'ORG-0100',
              pilots: [
                {
                  name: '孙七',
                  userCode: 'U010201',
                  orgCode: 'ORG-0102',
                  orgName: '杭州事业部',
                },
              ],
              children: [],
            },
          ],
        },
        {
          name: '华南分公司',
          orgCode: 'ORG-0200',
          parentCode: 'ORG-0001',
          pilots: [
            {
              name: '钱八',
              userCode: 'U0201',
              orgCode: 'ORG-0200',
              orgName: '华南分公司',
            },
            {
              name: '周九',
              userCode: 'U0202',
              orgCode: 'ORG-0200',
              orgName: '华南分公司',
            },
          ],
          children: [],
        },
      ],
    },
  ],
  total: 1,
} as API_ACTION_ITEM.res.GetPilotTreeRes
