---
nav:
  title: 组件
  path: /components
group:
  title: 编辑工具
  path: /components/radar-chart
---

# RadarChart

雷达图

## DEMO

```jsx
import { useState } from 'react';
import {
  RadarChart,
  Radar,
  Camera,
  ChartCircle,
  Target,
} from '@/components/Liqun';
import { radarRangeData } from './radarRangeData';

export default () => {
  const onClick = () => {
    console.log('onClick');
  };
  return (
    <div>
      <RadarChart
        id="timebar123"
        width={350}
        height={200}
        backgroundColor={'rgba(22, 32, 43, 0.9)'}
      >
        <Radar
          center={{ lng: 119.955925, lat: 30.289028 }} // 中心点
          radarRangeData={radarRangeData.data[0]} // 雷达范围
          angle={90} // 雷达范围获取时不是从正北开始，这里写90
        />
        <Camera
          fov={10} // 水平视场角
          yaw={10} // 偏航角
          dis={1000} // 相机最远有效可视距离
          color={'#15B371'}
        />
        <Camera fov={20} yaw={90} dis={500} color={'#DD4444'} />
        <ChartCircle
          point={{ lng: 119.958825, lat: 30.289128 }} // 震动仪坐标
          center={{ lng: 119.955925, lat: 30.289028 }} // 中心点
          radis={500} // 震动仪半径
          color={'#F29D49'}
          fill={'rgba(242, 157, 73, 0.26)'}
        />
        <Target
          point={{ lng: 119.958825, lat: 30.289128 }} // 震动仪坐标
          center={{ lng: 119.955925, lat: 30.289028 }} // 中心点
          radis={10} // 震动仪半径
          color={'#FFF'}
          fill={'#14CCBD'}
          onClick={onClick}
        />
      </RadarChart>
    </div>
  );
};
```

## API

<API id="RadarChart"></API>

<API id="Radar"></API>
