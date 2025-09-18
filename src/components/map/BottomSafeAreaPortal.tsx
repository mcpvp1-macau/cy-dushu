import { useInterval } from 'ahooks';
import { memo, useState, type FC } from 'react';
import { createPortal } from 'react-dom';

type PropsType = {
  children: React.ReactNode;
};

const BottomSafeAreaPortal: FC<PropsType> = memo(({ children }) => {
  const el = document.getElementById('bottom-safe-area');

  const [show, setShow] = useState(false);

  // 解决第一次进入时el不存在的问题
  useInterval(
    () => {
      const el = document.getElementById('bottom-safe-area');
      if (el) {
        setShow(true);
      }
    },
    !show ? 1000 : undefined,
  );
  if (!show && !el) return null;

  return el && createPortal(children, el);
});

BottomSafeAreaPortal.displayName = 'BottomSafeAreaPortal';

export default BottomSafeAreaPortal;
