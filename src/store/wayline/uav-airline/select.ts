import { useShallow } from 'zustand/react/shallow';
import useAirlineConfigStore from './useAirlineConfig.store';

export const useTakeOffRefPoint = () => {
  const airlineConfig = useAirlineConfigStore((s) => s.airlineConfig);
  return airlineConfig.takeOffRefPoint;
};

export const useCurrentAirpoint = () => {
  const { airpointsConfig, currentIndex } = useAirlineConfigStore(
    useShallow((s) => ({
      airpointsConfig: s.airpointsConfig,
      currentIndex: s.currentIndex,
    })),
  );
  return airpointsConfig[currentIndex];
};
