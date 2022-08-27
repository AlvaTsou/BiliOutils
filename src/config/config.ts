import type { LevelType } from '@/types/log';
import type { ActivityLotteryIdType, CouponBalanceUseType, SessionHandleType } from '@/types';
import {
  DAILY_RUN_TIME,
  LOTTERY_EXCLUDE,
  LOTTERY_INCLUDE,
  LOTTERY_UP_BLACKLIST,
  TODAY_MAX_FEED,
} from '@/constant';
import { cloneObject, getNewObject, deepMergeObject, arr2numArr } from '@/utils/pure';
import { getBiliJct, getUserId } from '../utils/cookie';
import { isArray, isString } from '../utils/is';

type DefaultConfig = typeof defaultConfig;
export type TheConfig = Omit<DefaultConfig, keyof typeof compatibleMap>;

export const defaultConfig = {
  cookie: '',
  accessKey: '',
  // acTimeValue: '',
  // accessRefreshToken: '',
  message: {
    br: '\n',
    email: {
      host: 'smtp.163.com',
      port: 465,
    },
    pushplusToken: process.env.PUSHPLUS_TOKEN?.trim(),
    api: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
      url: '',
      proxy: {
        host: '',
        port: 443,
        auth: '',
      },
      data: {},
    },
  },
  function: {
    // 瓜子兑换硬币
    silver2Coin: true,
    // 直播签到
    liveSignTask: true,
    // 投币
    addCoins: true,
    // 漫画签到
    mangaSign: false,
    // 分享和观看
    shareAndWatch: true,
    // 应援团签到
    supGroupSign: false,
    // 直播发送弹幕
    liveSendMessage: false,
    // 使用 b 币券
    useCouponBp: false,
    // 充电（废弃）
    charging: false,
    // 获取 vip 权益
    getVipPrivilege: false,
    // 直播赠送礼物
    giveGift: false,
    // 赛事竞猜
    matchGame: false,
    // 直播天选时刻
    liveLottery: false,
    // 直播天选红包
    liveRedPack: false,
    // 批量取关
    batchUnfollow: false,
    // 粉丝牌等级
    liveIntimacy: false,
    // 漫画任务
    mangaTask: false,
    // 大会员积分
    bigPoint: false,
    liveFamine: false,
    // 风纪委员
    judgement: false,
    // 转盘抽奖
    activityLottery: false,
  },
  log: {
    pushLevel: 'debug' as LevelType,
    consoleLevel: 'debug' as LevelType | boolean,
    fileLevel: 'debug' as LevelType | boolean,
    useEmoji: true,
    fileSplit: 'day' as 'day' | 'month',
  },
  limit: {
    // 获取经验限制为 6 级
    level6: true,
    // 投币限制为 5 颗
    coins5: true,
  },
  /** 调用api时的延迟(单位s),默认2s至6s */
  apiDelay: [2, 6],
  /**【可选】用户代理(浏览器) */
  userAgent: '',
  dailyRunTime: DAILY_RUN_TIME,
  // 老的配置
  // 全部是 undefined 是为了更好的合并
  targetLevel: undefined,
  stayCoins: undefined,
  targetCoins: undefined,
  customizeUp: undefined,
  giftUp: undefined,
  chargeUpId: undefined,
  chargePresetTime: undefined,
  matchCoins: undefined,
  matchSelection: undefined,
  matchDiff: undefined,
  // 新的配置方式
  match: {
    /** 压硬币数量 */
    coins: 2,
    /** 压硬币规则 大于0 是正压，小于反压 */
    selection: 1,
    /** 比赛赔率差距需要大于多少才压 */
    diff: 7,
  },
  charge: {} as any,
  couponBalance: {
    /** 充电的 up 默认自己 */
    mid: 0,
    /** 预设时间，哪一天？ */
    presetTime: [10, 20],
    /** 使用方式 */
    use: '充电' as CouponBalanceUseType,
  },
  gift: {
    /** 自定义投喂礼物用户列表 */
    mids: [] as number[],
    // 投喂礼物 id
    // 辣条 小心心 能量石头 PK票 小海浪
    id: [1, 30607, 30426, 31531, 31674],
    // 投喂礼物 name
    name: [] as string[],
  },
  coin: {
    /** 自定义高优先级用户列表 */
    customizeUp: [] as number[],
    /** 目标等级 默认6级 */
    targetLevel: 6,
    /** 最低剩余硬币数,默认0 */
    stayCoins: 0,
    /** 预计投币数,默认5 */
    targetCoins: 5,
    /** 如果获取今日已投币数量失败，假设已投币数量为多少 */
    todayCoins: 0,
  },
  sls: {
    name: '',
    description: '',
    region: 'ap-chengdu',
    dailyRunTime: DAILY_RUN_TIME,
  },
  lottery: {
    /** 天选屏蔽奖品 */
    excludeAward: LOTTERY_EXCLUDE,
    /** 天选包含奖品 */
    includeAward: LOTTERY_INCLUDE,
    /** 黑名单 */
    blackUid: LOTTERY_UP_BLACKLIST,
    /** 天选时刻关注 UP 移动到分组 */
    moveTag: '天选时刻',
    /** 天选获取的直播页数 */
    pageNum: 2,
    /** 关注回复处理方式  */
    actFollowMsg: 'read' as SessionHandleType,
    /** 扫描关注的用户 */
    scanFollow: undefined as string | 'only' | undefined,
    /** 跳过需要关注的天选 */
    skipNeedFollow: false,
    // 打印可能中奖的消息
    mayBeWinMsg: true,
  },
  redPack: {
    // 中场休息时间，当每参加了几个直播间的时候，休息一下 [参加个数，休息时间（分，-1 为直接结束）]
    restTime: [0, -1],
    // 同时参与的直播间数量
    linkRoomNum: 0,
    // 疑似触发风控时休眠时间（分），-1 为直接结束
    riskSleepTime: -1,
    // 总参与次数，达到后不管结果如何，直接结束
    totalNum: 0,
    // 参与直播时发送的弹幕数量（与内置数量比，较小者生效）
    // [固定值]，[最少,最多]
    dmNum: [5],
    // 是否在等待时处理关注用户（读取消息，移动）
    moveUpInWait: true,
    /** 天选时刻关注 UP 移动到分组 */
    moveTag: 'rp关注',
    /** 关注回复处理方式  */
    actFollowMsg: 'read' as SessionHandleType,
  },
  intimacy: {
    // 直播弹幕
    liveSendMessage: true,
    // 点赞直播间
    liveLike: true,
    // 30 分钟直播心跳
    liveHeart: false,
    // 白名单
    whiteList: [] as number[],
    // 黑名单
    blackList: [] as number[],
    // 每日亲密度上限 （系统 1500）
    limitFeed: TODAY_MAX_FEED,
  },
  jury: {
    mode: 1,
    once: true,
    vote: [0, 0, 1],
    opinionMin: 3,
    // 没有案件后的等待时间（分）
    waitTime: 20,
    // insiders 参考值
    insiders: 0.8,
  },
  manga: {
    // 签到
    sign: true,
    // 购买漫画
    buy: false,
    // 购买漫画 id（优先级高）
    mc: [] as number[],
    // 购买漫画名称（优先级中）
    name: [] as string[],
    // 购买追漫（优先级低）
    love: true,
    // 执行购买漫画间隔时间（单位天）
    buyInterval: 2,
    // 星期几执行购买漫画
    buyWeek: [] as number[],
  },
  exchangeCoupon: {
    // 兑换漫读券数量
    num: 1,
    // 间隔时间，单位 ms，随机误差 -50 ~ 150
    delay: 2000,
  },
  activity: {
    liveFamineTime: 400,
  },
  bigPoint: {
    // 是否重试，或者重试间隔时间，单位秒
    isRetry: true as boolean | number,
    // 是否观看视频
    isWatch: true,
    // 自定义观看视频的章节
    epids: [] as number[],
    // 领取任务后的观看延时（秒）
    watchDelay: 40,
  },
  activityLottery: {
    // 活动列表
    list: [] as ActivityLotteryIdType[],
    // 是否从网络请求活动列表
    isRequest: false,
    // 抽奖延时（秒）
    delay: [1.8, 3.2],
    // 追番？
    bangumi: false,
    // 关注？
    follow: false,
  },
  BILIJCT: '',
  USERID: 0,
};

export function getDefaultConfig() {
  return cloneObject(defaultConfig, true);
}

export function mergeConfig(config: RecursivePartial<DefaultConfig>) {
  return configValueHandle(
    oldConfigHandle(deepMergeObject(getDefaultConfig(), beforeMergeConfig(config))),
  );
}

/**
 * 兼容映射
 */
const compatibleMap = {
  targetLevel: ['coin', 'targetLevel'],
  stayCoins: ['coin', 'stayCoins'],
  targetCoins: ['coin', 'targetCoins'],
  customizeUp: ['coin', 'customizeUp'],
  giftUp: ['gift', 'mids'],
  chargeUpId: ['charge', 'mid'],
  chargePresetTime: ['charge', 'presetTime'],
  matchCoins: ['match', 'coins'],
  matchSelection: ['match', 'selection'],
  matchDiff: ['match', 'diff'],
};

/**
 * 旧配置兼容处理
 * @param config
 */
function oldConfigHandle(config: DefaultConfig): TheConfig {
  Object.keys(compatibleMap).forEach(oldKey => {
    if (config[oldKey] !== undefined) {
      const [newKey, newKey2] = compatibleMap[oldKey];
      config[newKey] = getNewObject(config[newKey]);
      config[newKey][newKey2] = config[oldKey];
    }
    delete config[oldKey];
  });

  // couponBalance charge
  config.couponBalance.mid ||= config.charge.mid;
  config.couponBalance.presetTime ||= config.charge.presetTime;

  return config;
}

/**
 * 配置默认值处理
 * @param config
 */
function configValueHandle(config: TheConfig) {
  setConstValue(config);
  const { coin, gift, match, couponBalance } = config;
  // TODO: 兼容旧配置
  if (!isArray(config.apiDelay)) {
    config.apiDelay = [Number(config.apiDelay)];
  } else {
    config.apiDelay = arr2numArr(config.apiDelay);
  }

  coin.customizeUp = arr2numArr(coin.customizeUp);
  gift.mids = arr2numArr(gift.mids);

  // 处理 charge
  const couponBalanceUse = couponBalance.use;
  switch (couponBalanceUse) {
    case 'battery':
      couponBalance.use = '电池';
      break;
    case 'charge':
      couponBalance.use = '充电';
      break;
    default:
      couponBalance.use = '充电';
      break;
  }

  /**
   * 部分默认值处理
   */
  if (gift.mids.length === 0) {
    gift.mids = coin.customizeUp;
  }
  if (!couponBalance.mid) {
    couponBalance.mid = config.USERID;
  }
  if (coin.targetCoins > 5) {
    coin.targetCoins = 5;
  }
  if (match.coins > 10) {
    match.coins = 10;
  }

  return config;
}

function setConstValue(config: TheConfig) {
  setCookieValue(config, config.cookie);
  return config;
}

export function setCookieValue(config: TheConfig, cookie: string) {
  config.BILIJCT = getBiliJct(cookie);
  config.USERID = getUserId(cookie);
  return config;
}

/**
 * 合并前处理用户配置
 * @param config
 */
function beforeMergeConfig(config: RecursivePartial<DefaultConfig>) {
  // 需要注意用户配置可能没有定义各种配置项
  const { message } = config;
  if (message && isString(message.api)) {
    const url = message.api;
    message.api = cloneObject(defaultConfig.message.api, true);
    message.api.url = url;
    message.api.method = 'GET';
  }
  return config;
}
