import { shouldJson } from '@/utils/json';
import { v4 as uuidv4 } from 'uuid';

export const resolvePositions = (positions: any) => {
  if (!Array.isArray(positions)) {
    new Error('请确保航点配置是数组');
  }
  return positions.map((p: any) => ({
    ...p,
    actions:
      p.actions?.map((action: any) => ({
        ...action,
        xid: uuidv4(), // xid 仅仅在前端使用
      })) ?? [],
    xid: uuidv4(), // xid 仅仅在前端使用
  }));
};

export const checkSaveData = (data: any) => {
  let error: string | undefined;
  const length =
    data?.taskTemplateInfo?.parameters?.spaces?.[0].positions?.length ?? 0;
  if (length < 2) {
    error = '航点数量不能少于 2 个';
  }
  const taskBasic = shouldJson(data?.taskTemplateInfo?.taskBasic);
  if (!taskBasic?.globalRTHHeight) {
    error = '请设置「返航高度」';
  }
  return error;
};
