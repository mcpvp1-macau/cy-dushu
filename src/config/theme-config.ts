import { theme, type ThemeConfig } from 'antd'

export const themeConfig: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#4C90F0',
    colorFillTertiary: 'rgba(112, 163, 251, 0.3)',
    colorBorder: '#37414D',
    boxShadow: 'none',
    controlItemBgActive: '#70A3FB',
    controlItemBgHover: '#70A3FB',
    colorBgSpotlight: 'rgba(0,0,0,1)',
    colorBgContainer: 'rgba(0,0,0,0)',
    colorPrimaryBg: '#4C90F0',
    borderRadius: 3,
    controlHeight: 30,
    colorBgElevated: '#28323C',
    colorBgContainerDisabled: '#262e36',
    colorLinkHover: '#3c89e8',
  },

  components: {
    Message: {
      margin: 100,
    },
    Dropdown: {
      controlItemBgHover: '#4c90f0',
      colorBgElevated: '#1c2630',
    },
    Button: {
      defaultBg: '#28323C',
      defaultBorderColor: '#37414D',
      defaultActiveBg: '#28323C',
      defaultActiveBorderColor: '#37414D',
      defaultHoverBg: '#28323C',
      defaultHoverBorderColor: '#37414D',
      contentLineHeightSM: 1,
      boxShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
      primaryShadow: 'none',
    },
    Radio: {
      colorBgContainer: '#28323C',
      colorBorder: 'rgba(255, 255, 255, 0)',
    },
    Collapse: {
      colorTextHeading: '#fff',
      headerPadding: '4px 12px',
      contentPadding: '0px',
      borderRadiusLG: 0,
    },
    Form: {
      itemMarginBottom: 12,
      labelColor: '#C7D1DC',
    },
    Input: {
      activeShadow: 'none',
      errorActiveShadow: 'none',
    },
    InputNumber: {
      activeShadow: 'none',
      errorActiveShadow: 'none',
    },
    Slider: {
      trackBg: '#4C90F0',
      trackHoverBg: '#4C90F0',
      colorBgElevated: '#ffffff',
      handleColor: '#ffffff',
      // handleActiveColor: '#ffffff',
      colorPrimaryBorderHover: '#ffffff',
      handleSize: 8,
      handleSizeHover: 10,
    },
    Tabs: {
      colorBorderSecondary: 'transparent',
      margin: 0,
      horizontalItemPadding: '0px 0',
      horizontalItemPaddingSM: '0px 0',
    },
    Segmented: {
      trackPadding: 0,
      trackBg: '#1C2630',
      itemSelectedBg: '#4C90F066',
      itemColor: '#4C90F0',
      itemSelectedColor: '#4C90F0',
    },
    DatePicker: {
      activeShadow: 'none',
    },
  },
}
