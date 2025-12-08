const _ATM = '/images/poi/ATM.png'
const _Bar = '/images/poi/Bar.png'
const a_yinhang = '/images/poi/a-yinhang.png'
const _bianlidian = '/images/poi/bianlidian.png'
const _bowuguan = '/images/poi/bowuguan.png'
const _chazhuang = '/images/poi/chazhuang.png'
const _chuidiao = '/images/poi/chuidiao.png'
const _dianyingyuan = '/images/poi/dianyingyuan.png'
const _dingwei = '/images/poi/dingwei.png'
const _dongwuyuan = '/images/poi/dongwuyuan.png'
const _duchang = '/images/poi/duchang.png'
const _dujia = '/images/poi/dujia.png'
const _gaoerfu = '/images/poi/gaoerfu.png'
const _gaojia = '/images/poi/gaojia.png'
const gongce = '/images/poi/gongce.png'
const gongjiaozhan = '/images/poi/gongjiaozhan.png'
const gongyuan = '/images/poi/gongyuan.png'
const _guji = '/images/poi/guji.png'
const _guojixuexiao = '/images/poi/guojixuexiao.png'
const _guojiyiyuan = '/images/poi/guojiyiyuan.png'
const _haiyangguan = '/images/poi/haiyangguan.png'
const _huwai = '/images/poi/huwai.png'
const jiaotang = '/images/poi/jiaotang.png'
const _jiayouzhan = '/images/poi/jiayouzhan.png'
const _jichang = '/images/poi/jichang.png'
const jingqu = '/images/poi/jingqu.png'
const _jingwushi = '/images/poi/jingwushi.png'
const _jinianguan = '/images/poi/jinianguan.png'
const _jiudian = '/images/poi/jiudian.png'
const _juyuan = '/images/poi/juyuan.png'
const _kouqiangyiyuan = '/images/poi/kouqiangyiyuan.png'
const _lingyuan = '/images/poi/lingyuan.png'
const _matou = '/images/poi/matou.png'
const _meishuguan = '/images/poi/meishuguan.png'
const qichechongdianzhan = '/images/poi/qichechongdianzhan.png'
const qichezulin = '/images/poi/qichezulin.png'
const qijiandian = '/images/poi/qijiandian.png'
const _shanfeng = '/images/poi/shanfeng.png'
const shangchang = '/images/poi/shangchang.png'
const _shatan = '/images/poi/shatan.png'
const _shenghuoguan = '/images/poi/shenghuoguan.png'
const _simiao = '/images/poi/simiao.png'
const tingchechang = '/images/poi/tingchechang.png'
const tiyuchang = '/images/poi/tiyuchang.png'
const _tubu = '/images/poi/tubu.png'
const _tushuguan = '/images/poi/tushuguan.png'
const weizhi = '/images/poi/weizhi.png'
const _xiaofang = '/images/poi/xiaofang.png'
const xuexiao = '/images/poi/xuexiao.png'
const yiliao = '/images/poi/yiliao.png'
const _yinyuejuchang = '/images/poi/yinyuejuchang.png'
const _yishuzhongxin = '/images/poi/yishuzhongxin.png'
const yiyuan = '/images/poi/yiyuan.png'
const _yizhogongyuan = '/images/poi/yizhogongyuan.png'
const _youleyuan = '/images/poi/youleyuan.png'
const _youyongguan = '/images/poi/youyongguan.png'
const _youzheng = '/images/poi/youzheng.png'
const zaocan = '/images/poi/zaocan.png'
const _zhanlanguan = '/images/poi/zhanlanguan.png'
const zhengfu = '/images/poi/zhengfu.png'
const _zhiwuyuan = '/images/poi/zhiwuyuan.png'
const _zongjiao = '/images/poi/zongjiao.png'

const iconMap = new Map<string, string>([
  ['体育休闲服务', tiyuchang],
  ['交通设施服务', jiaotang],
  ['医疗保健服务', yiliao],
  ['综合医院', yiyuan],
  ['风景名胜', jingqu],
  ['公园广场', gongyuan],
  ['摩托车服务', qijiandian],
  ['汽车服务', qichezulin],
  ['汽车销售', qichezulin],
  ['汽车维修', qichezulin],
  ['公共设施', gongce],
  ['科教文化服务', xuexiao],
  ['政府机构及社会团体', zhengfu],
  ['金融保险服务', a_yinhang],
  ['餐饮服务', zaocan],
  ['购物服务', shangchang],
  ['道路附属设施', weizhi],
  ['停车场', tingchechang],
  ['长途汽车站', gongjiaozhan],
  ['出租车', qichezulin],
  ['地铁站', gongjiaozhan],
  ['公交车站', gongjiaozhan],

  ['充电站', qichechongdianzhan],
  ['换电站', qichechongdianzhan],

  ['GovernmentAndSocialOrganizations', zhengfu],
  ['CarService', qichezulin],
  ['CarSales', qichezulin],
  ['RoadFacilities', weizhi],
  ['CateringService', zaocan],
  ['TransportationFacilities', jiaotang],
  ['MedicalCareService', yiliao],
  ['ShoppingService', shangchang],
  ['SportsAndLeisure', tiyuchang],
  ['CompaniesAndEnterprises', weizhi],
  ['ScenicSpot', jingqu],
  ['MotorcycleService', qijiandian],
  ['CarMaintenance', qichezulin],
  ['FinancialAndInsuranceService', a_yinhang],
  ['BusinessAndResidential', weizhi],
  ['ScienceEducationAndCulture', xuexiao],
  ['PublicFacilities', gongce],
  ['LifeService', weizhi],
])

export const getPOIIcon = (type: string[] | string): string => {
  if (Array.isArray(type)) {
    for (const t of type) {
      const v = iconMap.get(t)
      if (v) {
        return v
      }
    }
    return weizhi
  } else {
    const v = iconMap.get(type)
    return v || weizhi
  }
}
