// Type
// CONST 常驻
// TEMP 会更改
// TEMP_IN_TURN 在END_TURN的时候去除

const FighterStatusList = [
    {
        Name: "NO_HIT",
        Desc: "不能被施加直击卡",
        Type: "CONST"
    },
    {
        Name: "HALF_MAGIC",
        Desc: "施加在它身上的效果卡法力值减半",
        Type: "CONST"
    }
    , {
        Name: "NUM_OPPOSITE",
        Desc: "在它身上施加的属性效果取相反数",
        Type: "CONST"
    }, {
        Name: "WARM_UP",
        Desc: "本回合内下一张卡牌效果+2/+1",
        Type: "TEMP"
    }, {
        Name: "WARM_UP_PLUS",
        Desc: "本回合内下一张卡牌效果+4/+1",
        Type: "TEMP"
    }, {
        Name: "WEAKEN_TWICE",
        Desc: "在该卡牌生效后,指定角斗士接下来两次生命值/法力值变化-3/-1",
        Type: "TEMP_IN_TURN"
    }, {
        Name: "STRENGTHEN_TWICE",
        Desc: "在该卡牌生效后，指定角斗士接下来三次生命值/法力值变化+2/+0",
        Type: "TEMP_IN_TURN"
    }
]

const FighterList = [{
    Id: 1,
    Name: "不死的骷髅战士",
    Desc: "毕竟它只是一副骨架",
    InitHealth: 5,
    InitMagic: 0,
    Health: 5,
    Magic: 0,
    ConstBuffList: ["NO_HIT"],
    TempBuffList: [],
    CreditFactor: 1.0,
}, {
    Id: 2,
    Name: "稳定的能量体",
    Desc: "不像它暴躁的同族,这个能量体天性温和",
    InitHealth: 5,
    InitMagic: 5,
    Health: 5,
    Magic: 5,
    ConstBuffList: ["HALF_MAGIC"],
    TempBuffList: [],
    CreditFactor: 1.0,
}, {
    Id: 3,
    Name: "丑陋的魅魔",
    Desc: "它很渴望一次真实的爱情",
    InitHealth: 9,
    InitMagic: 0,
    Health: 9,
    Magic: 0,
    ConstBuffList: [],
    TempBuffList: [],
    CreditFactor: 1.0,
}, {
    Id: 4,
    Name: "开心的暗影怪",
    Desc: "尽管它很开心,看起来还是充满负能量",
    InitHealth: 6,
    InitMagic: -2,
    Health: 6,
    Magic: -2,
    ConstBuffList: ["NUM_OPPOSITE"],
    TempBuffList: [],
    CreditFactor: 1.0,
}];

module.exports = {
    FighterList: FighterList,
    FighterStatusList: FighterStatusList,
}