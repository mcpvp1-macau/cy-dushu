import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type TargetType = {
  distance: number;
  sourceType: string;
  status: number;
  targetAltitude: number;
  targetId: number;
  targetLatitude: number;
  targetLongitude: number;
  targetType: string;
  timestamp?: number;
};

type StateType = {
  targets: TargetType[];
  targetsRecord: Record<number, TargetType[]>;
};

type ActionsType = {
  updateTargets: (value: TargetType[]) => void;
};

/** 目标信息 */
const useControlRoomTargetInfoStore = create<StateType & ActionsType>()(
  devtools(
    (set, get) => ({
      targets: [],
      targetsRecord: {},
      updateTargets: (targets) => {
        const map = get().targetsRecord;
        const newMap: Record<number, TargetType[]> = {};
        for (const target of targets) {
          const { targetId: tid } = target;
          newMap[tid] = [];
          newMap[tid].push(...(map[tid] || []).slice(-2000)); // 只保留最新的 2000 个
          newMap[tid].push(target);
        }
        set({ targets, targetsRecord: newMap }, false, 'updateTargets');
      },
    }),
    {
      name: 'control-room-target-info',
      enabled: process.env.NODE_ENV === 'development' && false,
    },
  ),
);

export default useControlRoomTargetInfoStore;
