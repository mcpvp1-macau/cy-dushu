import { formatSecMMSS } from '@/utils/format/time';
import { useMemoizedFn } from 'ahooks';
import { Slider, Spin } from 'antd';
import classNames from 'clsx';
import {
  ComponentRef,
  memo,
  ReactNode,
  useEffect,
  useRef,
  useState,
  type FC,
} from 'react';
import CyberPlayer, {
  TimeUpdateEvent,
  VideoInfoEvent,
} from '../Video/CyberPlayer';

type PropsType = {
  src: string;
  rightTools?: ReactNode;
  playing?: boolean;
  time: number;
};

const VideoPlayer: FC<PropsType> = memo(
  ({ src, rightTools, playing, time }) => {
    // const [isPlaying, setIsPlaying] = useState(true);

    const playerRef = useRef<ComponentRef<typeof CyberPlayer>>(null);
    const [buffering, setBuffering] = useState(true);

    const handlePlay = useMemoizedFn(() => {
      playerRef.current?.play();
    });

    const handlePause = useMemoizedFn(() => {
      playerRef.current?.pause();
    });

    const [aspectRatio, setAspectRatio] = useState(16 / 9);
    const [duration, setDuration] = useState(0);
    const handleVideoInfo = useMemoizedFn((e: VideoInfoEvent) => {
      setAspectRatio(e.width / e.height);
      setDuration(e.duration);
    });

    const [currentPosition, setCurrentPosition] = useState(0);
    const handleTimeUpdate = useMemoizedFn((e: TimeUpdateEvent) => {
      if (skipTimeEventRef.current) {
        return;
      }
      setCurrentPosition(e.position);
    });

    const handlePlayerStateChange = useMemoizedFn(({ type }: any) => {
      if (type === 'buffer') {
        setBuffering(true);
        return;
      }
      setBuffering(false);
      // setIsPlaying(type === 'play');
    });

    const skipTimeEventRef = useRef(false);
    const handleSliderChange = useMemoizedFn((value: number) => {
      skipTimeEventRef.current = true;
      setCurrentPosition(value);
    });
    const handleSliderChangeComplete = useMemoizedFn((value: number) => {
      skipTimeEventRef.current = false;
      playerRef.current?.seek(value);
    });

    const [mouseIn, setMouseIn] = useState(false);

    useEffect(() => {
      if (playing) {
        handlePlay();
      } else {
        handlePause();
      }
    }, [playing]);

    useEffect(() => {
      if (time - currentPosition > 5 || time - currentPosition < -5) {
        playerRef.current?.seek(time);
      }
    }, [time]);

    return (
      <div
        className="relative w-full"
        style={{ aspectRatio }}
        onMouseEnter={() => setMouseIn(true)}
        onMouseLeave={() => setMouseIn(false)}
      >
        <div className="absolute inset-0">
          <CyberPlayer
            ref={playerRef}
            autostart={false}
            src={src}
            onVideoInfo={handleVideoInfo}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlayerStateChange}
            onPause={handlePlayerStateChange}
            onBuffer={handlePlayerStateChange}
          />
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <Spin spinning={buffering} size="large" />
        </div>

        <aside
          className={classNames(
            'absolute bottom-0 left-0 right-0 bg-opacity-80 bg-gradient-to-t p-1 px-3 transition-opacity duration-500',
            'from-neutral-950 from-0% to-[100%]',
            {
              'opacity-0': !mouseIn,
            },
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              <span>{formatSecMMSS(currentPosition)}</span>-
              <span>{formatSecMMSS(duration)}</span>
            </div>
            <div className="flex-1">
              <Slider
                max={duration}
                min={0}
                value={currentPosition}
                tooltip={{ formatter: formatSecMMSS }}
                onChange={handleSliderChange}
                onChangeComplete={handleSliderChangeComplete}
              />
            </div>
            {rightTools}
          </div>
        </aside>
      </div>
    );
  },
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
