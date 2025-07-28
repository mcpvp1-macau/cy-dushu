import styles from './index.module.less'
import IconLoudspeaker from '@/assets/icons/jsx/IconLoudspeaker'
import { Input, Radio, Slider } from 'antd'

type ConfigType = {
  action: string // start 开始播放 stop 停止播放
  mode: string // single 单次播放 loop 循环播放
  volume: number // 音量
  text: string
}

type PropsType = {
  config: ConfigType
  onChange: (value: ConfigType) => unknown
}

const Loudspeaker: FC<PropsType> = ({ config, onChange }) => {
  const { t } = useTranslation()

  return (
    <div>
      <div className={styles.titleHeader}>
        <div className={styles.subTitle}>
          <IconLoudspeaker />
          <span className={styles.text}>
            {t('wayline.waylinePoint.actions.SPEAKER_PLAY.title')}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span>{t('common.action')}</span>
          <Radio.Group
            value={config.action}
            options={[
              { label: t('common.start'), value: 'start' },
              { label: t('common.stop'), value: 'stop' },
            ]}
            onChange={(e) => onChange({ ...config, action: e.target.value })}
          />
        </div>
        {config.action === 'start' && (
          <>
            <div className="flex items-center gap-3">
              <span>{t('common.mode')}</span>
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                className="w-full flex gap-[1px]"
                value={config.mode}
                size="small"
                onChange={(e) => onChange({ ...config, mode: e.target.value })}
              >
                <Radio.Button className="flex-1 text-center" value="single">
                  {t('common.single')}
                </Radio.Button>
                <Radio.Button className="flex-1 text-center" value="loop">
                  {t('common.loop')}
                </Radio.Button>
              </Radio.Group>
            </div>
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap">
                {t('common.voiceVolume')}
              </span>
              <Slider
                min={0}
                max={100}
                className="w-full my-0"
                defaultValue={config.volume}
                onChangeComplete={(e) => onChange({ ...config, volume: e })} // 处理滑动结束事件
              />
            </div>
            <div className="flex items-start gap-3">
              <span className="whitespace-nowrap">{t('common.content')}</span>
              <Input.TextArea
                value={config.text}
                placeholder={t('common.form.pleaseInput')}
                onChange={(e) => onChange({ ...config, text: e.target.value })}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const memorizedCpn = memo(Loudspeaker)
memorizedCpn.displayName = 'Loudspeaker'

export default memorizedCpn
