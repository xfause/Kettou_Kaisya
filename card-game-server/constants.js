// {
//     id: 0,
//     name: "xxxxxx",
//     cardType: CardType.CHARACTER,
//     cost: 3,
//     content: `xxxxxxxxxx`,
//     attack: 2,
//     life: 1,
//     attackBase: 2,
//     lifeBase: 1,
//     type: [""],
//     isStrong: true,
//     isFullOfEnergy: true,
//     isDedication: true,
//     onStart: function() {},
//     onOtherCardStart: function() {},
//     onMyTurnStart: function() {},
//     onMyTurnEnd: function() {},
//     onChooseTarget: function() {},
//     onEnd: function() {},
//     onTableCardChange: function() {},
// }

const JudgerList = [
  {
    id: 1,
    name: '老板的侄子',
    desc: "本回合裁判没有效果",
    OnBetStage: function () {

    },
    OnCardStage: function () {

    },
    OnJudgeStage: function () {

    },
    OnCalcStage: function () {

    }
  },
];

const FateCardList = [
  {
    id: 1,
    name: 'fate 1',
    desc: "do nothing",
    OnBetStage: function () {

    },
    OnCardStage: function () {

    },
    OnJudgeStage: function () {

    },
    OnCalcStage: function () {

    }
  }
];

// type
// CONST 常驻
// TEMP 会更改
// TEMP_IN_TURN 在END_TURN的时候去除

const FighterStatusList = [
  {
    name: "NO_HIT",
    desc: "不能被施加直击卡",
    type: "CONST"
  },
  {
    name: "HALF_MAGIC",
    desc: "施加在它身上的效果卡法力值减半",
    type: "CONST"
  }
  ,{
    name: "NUM_OPPOSITE",
    desc: "在它身上施加的属性效果取相反数",
    type: "CONST"
  }, {
    name: "WARM_UP",
    desc: "本回合内下一张卡牌效果+2/+1",
    type: "TEMP"
  }, {
    name: "WARM_UP_PLUS",
    desc: "本回合内下一张卡牌效果+4/+1",
    type: "TEMP"
  }, {
    name: "WEAKEN_TWICE",
    desc: "在该卡牌生效后,指定角斗士接下来两次生命值/法力值变化-3/-1",
    type: "TEMP_IN_TURN"
  }, {
    name: "STRENGTHEN_TWICE",
    desc: "在该卡牌生效后，指定角斗士接下来三次生命值/法力值变化+2/+0",
    type: "TEMP_IN_TURN"
  }
]

const FighterList = [{
  id: 1,
  name: "不死的骷髅战士",
  health: 5 ,
  magic: 0,
  healthBase: 5,
  magicBase: 0,
  desc: "毕竟它只是一副骨架",
  statusList: ["NO_HIT"],
  // 倍率
  magnification: 1.0,
}, {
  id: 2,
  name: "稳定的能量体",
  health: 5,
  magic: 5,
  healthBase: 5,
  magicBase: 5,
  desc: "不像它暴躁的同族,这个能量体天性温和",
  statusList: ["HALF_MAGIC"],
  // 倍率
  magnification: 1.0,
}, {
  id: 3,
  name: "丑陋的魅魔",
  health: 9,
  magic: 0,
  healthBase: 9,
  magicBase: 0,
  desc: "它很渴望一次真实的爱情",
  statusList: [],
  // 倍率
  magnification: 1.0,
}, {
  id: 4,
  name: "开心的暗影怪",
  health: 6,
  magic: -2,
  healthBase: 6,
  magicBase: -2,
  desc: "尽管它很开心,看起来还是充满负能量",
  statusList: ["NUM_OPPOSITE"],
  // 倍率
  magnification: 1.0,
}];

module.exports = {
  Fighters: FighterList,
  Judgers: JudgerList,
  FateCards: FateCardList,
  FighterStatusList: FighterStatusList,
}