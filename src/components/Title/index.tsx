import { Flex, Typography } from 'antd';
import { TitleProps as AntdTitleProps } from 'antd/es/typography/Title';
import React, { ReactNode } from 'react';

export type TitleProps = AntdTitleProps & {
  // 是否有竖条
  bar?: boolean;
  barStyle?: React.CSSProperties;
  // 竖条和标题之间的间距
  gap?: number;
  // 标题的内容
  children?: ReactNode;
};

const Title = ({
  bar = false,
  title,
  gap = 8,
  barStyle = {},
  children,
  ...props
}: TitleProps) => {
  return (
    <Flex gap={gap} align="center">
      {bar && (
        <div
          className="inline-block w-[2px] h-[12px]"
          style={{ backgroundColor: '#5db2a1', ...barStyle }}
        />
      )}
      <Typography.Title
        {...props}
        style={{
          margin: 0,
          fontSize: props.level ? undefined : 14,
          fontWeight: 400,
          ...(props.style || {}),
        }}
      >
        {children}
      </Typography.Title>
    </Flex>
  );
};

export default Title;
