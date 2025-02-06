const ATM = '/images/poi/ATM.png'
const Bar = '/images/poi/Bar.png'
const a_yinhang = '/images/poi/a-yinhang.png'
const bianlidian = '/images/poi/bianlidian.png'
const bowuguan = '/images/poi/bowuguan.png'
const chazhuang = '/images/poi/chazhuang.png'
const chuidiao = '/images/poi/chuidiao.png'
const dianyingyuan = '/images/poi/dianyingyuan.png'
const dingwei = '/images/poi/dingwei.png'
const dongwuyuan = '/images/poi/dongwuyuan.png'
const duchang = '/images/poi/duchang.png'
const dujia = '/images/poi/dujia.png'
const gaoerfu = '/images/poi/gaoerfu.png'
const gaojia = '/images/poi/gaojia.png'
const gongce = '/images/poi/gongce.png'
const gongjiaozhan = '/images/poi/gongjiaozhan.png'
const gongyuan = '/images/poi/gongyuan.png'
const guji = '/images/poi/guji.png'
const guojixuexiao = '/images/poi/guojixuexiao.png'
const guojiyiyuan = '/images/poi/guojiyiyuan.png'
const haiyangguan = '/images/poi/haiyangguan.png'
const huwai = '/images/poi/huwai.png'
const jiaotang = '/images/poi/jiaotang.png'
const jiayouzhan = '/images/poi/jiayouzhan.png'
const jichang = '/images/poi/jichang.png'
const jingqu = '/images/poi/jingqu.png'
const jingwushi = '/images/poi/jingwushi.png'
const jinianguan = '/images/poi/jinianguan.png'
const jiudian = '/images/poi/jiudian.png'
const juyuan = '/images/poi/juyuan.png'
const kouqiangyiyuan = '/images/poi/kouqiangyiyuan.png'
const lingyuan = '/images/poi/lingyuan.png'
const matou = '/images/poi/matou.png'
const meishuguan = '/images/poi/meishuguan.png'
const qichechongdianzhan = '/images/poi/qichechongdianzhan.png'
const qichezulin = '/images/poi/qichezulin.png'
const qijiandian = '/images/poi/qijiandian.png'
const shanfeng = '/images/poi/shanfeng.png'
const shangchang = '/images/poi/shangchang.png'
const shatan = '/images/poi/shatan.png'
const shenghuoguan = '/images/poi/shenghuoguan.png'
const simiao = '/images/poi/simiao.png'
const tingchechang = '/images/poi/tingchechang.png'
const tiyuchang = '/images/poi/tiyuchang.png'
const tubu = '/images/poi/tubu.png'
const tushuguan = '/images/poi/tushuguan.png'
const weizhi = '/images/poi/weizhi.png'
const xiaofang = '/images/poi/xiaofang.png'
const xuexiao = '/images/poi/xuexiao.png'
const yiliao = '/images/poi/yiliao.png'
const yinyuejuchang = '/images/poi/yinyuejuchang.png'
const yishuzhongxin = '/images/poi/yishuzhongxin.png'
const yiyuan = '/images/poi/yiyuan.png'
const yizhogongyuan = '/images/poi/yizhogongyuan.png'
const youleyuan = '/images/poi/youleyuan.png'
const youyongguan = '/images/poi/youyongguan.png'
const youzheng = '/images/poi/youzheng.png'
const zaocan = '/images/poi/zaocan.png'
const zhanlanguan = '/images/poi/zhanlanguan.png'
const zhengfu = '/images/poi/zhengfu.png'
const zhiwuyuan = '/images/poi/zhiwuyuan.png'
const zongjiao = '/images/poi/zongjiao.png'

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
