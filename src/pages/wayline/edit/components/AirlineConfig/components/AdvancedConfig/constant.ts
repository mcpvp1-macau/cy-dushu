export const moreFormItems = [
  {
    label: '航点类型',
    key: 'globalWaypointTurnMode',
    options: [
      {
        label: '协调转弯，不过点，提前转弯',
        value: 'coordinateTurn',
      },
      {
        label: '直线飞行，飞行器到点停',
        value: 'toPointAndStopWithDiscontinuityCurvature',
      },
      {
        label: '曲线飞行，飞行器到点停',
        value: 'toPointAndStopWithContinuityCurvature',
      },
      {
        label: '曲线飞行，飞行器过点不停',
        value: 'toPointAndPassWithContinuityCurvature',
      },
    ],
  },
  {
    label: '飞行器偏航角模式',
    key: 'waypointHeadingMode',
    options: [
      {
        label: '沿航线方向',
        value: 'followWayline',
      },
      {
        label: '手动控制',
        value: 'manually',
      },
      // {
      //   label: '锁定当前偏航角',
      //   value: 'fixed',
      // },
      // {
      //   label: '自定义',
      //   value: 'smoothTransition',
      // },
      // {
      //   label: '目标偏航角',
      //   value: 'waypointHeadingAngle',
      // },
      // {
      //   label: '朝向兴趣点',
      //   value: 'towardPOI',
      // },
    ],
  },
  {
    label: '航点间云台俯仰角控制模式',
    key: 'gimbalPitchMode',
    options: [
      {
        label: '手动控制',
        value: 'manual',
      },
      {
        label: '依照每个航点设置',
        value: 'fixed',
      },
    ],
  },
  {
    label: '航线结束动作',
    key: 'finishAction',
    options: [
      {
        label: '自动返航',
        value: 'GO_HOME',
      },
      {
        label: '退出航线模式',
        value: 'NO_ACTION',
      },
    ],
  },
];
