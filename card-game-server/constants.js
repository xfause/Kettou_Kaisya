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

// todo
const CardList = [
  {
    id: 1,
    name: "card 1",
    type: "HIT",
    desc: "desc 1",
    needTarget: true,
    targetType: "table",
    targetId: -1,
    OnCardStage: function () {

    },
    OnJudgeStage: function () {

    }
  }, {
    id: 2,
    name: "card 2",
    type: "EFFECT",
    desc: "desc 2",
    needTarget: false,
    OnCardStage: function () {

    },
    OnJudgeStage: function () {

    }
  }, {
    id: 3,
    name: "card 3",
    type: "HIT",
    desc: "desc 3",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardStage: function () {

    },
    OnJudgeStage: function () {

    }
  }, {
    id: 4,
    name: "card 4",
    type: "EFFECT",
    desc: "desc 4",
    needTarget: false,
    OnCardStage: function () {

    },
    OnJudgeStage: function () {

    }
  }
]

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

const FighterStatusList = [
  {
    name: "NO_HIT",
    desc:"不能被施加直击卡"
  },
  {
    name: "HALF_MAGIC",
    desc: "施加在它身上的效果卡法力值减半"
  }
  ,{
    name: "NUM_OPPOSITE",
    desc: "在它身上施加的属性效果取相反数"
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
  name: "fighter4",
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
  Cards: CardList,
  Fighters: FighterList,
  Judgers: JudgerList,
  FateCards: FateCardList,
  FighterStatusList: FighterStatusList,
}