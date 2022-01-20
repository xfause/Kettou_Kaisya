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

const CardType = {
    EFFECT: 1, // 效果牌
    CHARACTER: 2, // 人物牌
};

const CardList = [
    {
        id: 1,
        name: "励志的演说家",
        cardType: CardType.CHARACTER,
        cost: 2,
        content: ``,
        attack: 1,
        life: 2,
        attackBase: 1,
        lifeBase: 2,
        type: [""]
    },
    {
        id: 5,
        name: "高级程序员",
        cardType: CardType.CHARACTER,
        cost: 7,
        content: ``,
        attack: 7,
        life: 7,
        attackBase: 7,
        lifeBase: 7,
        type: [""],
        isStrong: true
    },
    {
        id: 6,
        name: "开发助理",
        cardType: CardType.CHARACTER,
        cost: 1,
        content: ``,
        attack: 1,
        life: 1,
        attackBase: 1,
        lifeBase: 1,
        type: [""]
    },
    {
        id: 8,
        name: "丑陋的开发鼓励师",
        cardType: CardType.CHARACTER,
        cost: 1,
        content: `精力充沛`,
        attack: 1,
        life: 1,
        attackBase: 1,
        lifeBase: 1,
        type: [""],
        isFullOfEnergy: true
    }
];

const AttackType = {
    ATTACK: 1,
    BE_ATTACKED: 2
};

const AttackAnimationType = {
    NORMAL: 1
};



// new

const JudgerList = [
    {
        id: 1,
        name: '老板的侄子',
        desc: "本回合裁判没有效果",
        OnBetStage: function(){
            
        },
        OnCardStage: function () {
            
        },
        OnJudgeStage: function () {
            
        },
        OnCalcStage: function () {
            
        }
    }
];

const FateCardList = [
    {
        id: 1,
        name: 'fate 1',
        desc: "fate desc 1",
        OnBetStage: function(){
            
        },
        OnCardStage: function () {
            
        },
        OnJudgeStage: function () {
            
        },
        OnCalcStage: function () {
            
        }
    }
];

const FighterList = [{
    id: 1,
    name: "fighter1",
    health: 1,
    magic: 1,
    healthBase: 1,
    magicBase: 1,
    desc: "test content 1",
    // 倍率
    magnification: 1.0,
    OnCardStage: function () {
        
    },
    OnJudgeStage: function () {
        
    },
    OnCalcStage: function () {
        
    }
}, {
    id: 2,
    name: "fighter2",
    health: 2,
    magic: 2,
    healthBase: 2,
    magicBase: 2,
    desc: "test content 2",
    // 倍率
    magnification: 1.0,
    // todo
}, {
    id: 3,
    name: "fighter3",
    health: 3,
    magic: 3,
    healthBase: 3,
    magicBase: 3,
    desc: "test content 3",
    // 倍率
    magnification: 1.0,
    // todo
}, {
    id: 4,
    name: "fighter4",
    health: 4,
    magic: 4,
    healthBase: 4,
    magicBase: 4,
    desc: "test content 4",
    // 倍率
    magnification: 1.0,
    // todo
}];

module.exports = {
    CardType,
    Cards: CardList,
    AttackType,
    AttackAnimationType,

    Fighters: FighterList,
    Judgers: JudgerList,
    FateCards: FateCardList,
}