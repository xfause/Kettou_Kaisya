## Room Config
```json
{
    RoomPlayerLimit: "int / 房间内玩家最大人数",
    HandCardCountLimit: "int / 玩家手牌上限",
    InitHandCardCount: "int / 玩家初始获得手牌数量"
    FighterCountLimit: "int / 牌桌角斗士数量上限",
    PassCardFee: "int / 过牌消耗资金",
    UseCardFee: "Array[int] / 每回合出牌消耗资金",
    RoundLimit: "int / 回合上限",
    RoundInitCredit: "int / 回合恢复资金",
    MaxBetFighterCount: "int / 玩家下注的角斗士数量上限",
    MinBetCredit: "int / 每手下注的资金下限",

}
```

## Room Data

```json
{
    Seed: "Float / 随机数种子",
    RandFunc: "Func / 随机方法 seedrandom(Seed)",

    // Default Room Config
    RoomConfig: "RoomConfig: 房间配置",

    PublicJackpot: "int / 公共奖池",
    CurrentPlayerIndex: "int / 当前操作玩家Index",
    StartPlayerIndex: "int / 当前回合第一名开始操作的玩家Index",
    CurrentRound: "int / 当前是第几回合",
    // "PREPARE / BET / CARD / JUDGE / CALC"
    CurrentStage: "String / 当前游戏阶段"
    WinFighterId: "int / 获胜角斗士id"

    // 裁判牌信息
    JudgerCardInfo: "JudgeCard / 裁判牌",
    // 角斗士信息
    FighterInfoList: ["Fighter / 角斗士信息", ...],
    // 牌桌上已使用的手牌列表
    TableCardList: [{
        Card: "Card / 卡牌信息",
        Cost: "int / 使用该卡的费用",
        TargetId: "String / 使用对象的ID, 非指向性卡牌N/A",
        UserIndex: "String / 使用该卡牌的玩家的序号",
        IsActive: "bool / 是否已被激活"
    }],
    // 玩家信息
    PlayerList: [{
        UserUid: "String / 用户唯一ID",
        Socket: "socket / socket对象",
        GameRoomNumber: "String / 游戏房间号",
        Index: "int / 玩家在房间内的序号",
        TempCredit: "int / 临时资金",
        WinCredit: "int / 胜点"
        // "BETED / NOT_BETED / FOLDED/ NOT_FOLDED / NOT_USED_CARD / USED_CARD / CHECKED_CARD"
        // "OFFLINE"
        Status: "String / 玩家目前状态",
        BetDetails: 
        [{
            FighterId: "String / 角斗士编号",
            BetCredit: "int / 下注金额",
        }]
        HandCards: ["Card / 手牌信息", ...],
        RemainCards: ["Card / 牌库信息", ...],
        ConstBuffList: ["String / 玩家永久BUFF词条"],
        TempBuffList: ["String / 玩家临时BUFF词条"],
    }]

}
```

## Card
```json
{
    Id: "String / 卡牌ID",
    Name: "String / 名称",
    Desc: "String / 描述",
    DefaultIsActive: "bool / 默认是否明牌",
    IsActive: "bool / 当前是否明牌"
    IsNeedTarget: "bool / 是否是指向性",
    // TABLE / FIGHTER / PLAYER / OTHER_PLAYER
    TargetType: "String / 指向目标类型",
    // 卡牌效果
    // 如果没有对应效果则没有该项
    // 获取卡牌后
    OnAfterGetCard: "Func / (RoomData) / return RoomData",
    // 使用卡牌后
    OnAfterUseCard: "Func / (RoomData) / return RoomData",
    // 其他卡牌使用后
    OnAfterUseOtherCard: "Func / (RoomData) / return RoomData",
    // 卡牌在判定阶段亮牌后
    OnAfterCardActiveInJudgeStage: "Func / (RoomData) / return RoomData",
    // 卡牌在判定阶段其他卡牌亮牌后
    OnAfterOtherCardActiveInJudgeStage: "Func / (RoomData) / return RoomData",
}
```

## JudgerCard
```json
{
    Id: "String / 裁判编号",
    Name: "String / 名称",
    Desc: "String / 描述",
    IsActive: "bool / 是否翻开"
    // 裁判牌触发效果
    // 如果没有对应阶段效果则没有该项
    // 下注阶段结束后
    OnAfterPlayerBetStage: "Func / (RoomData) / return RoomData",
    // 玩家出牌阶段开始前
    OnBeforePlayerUseCardStage: "Func / (RoomData) / return RoomData",
    // 玩家出牌阶段结束后
    OnAfterPlayerUseCardStage: "Func / (RoomData) / return RoomData",
    // 玩家弃牌前
    OnBeforePlayerFoldCard: "Func / (RoomData) / return RoomData",
    // 玩家弃牌后
    OnAfterPlayerFoldCard: "Func / (RoomData) / return RoomData",
    // 玩家过牌前
    OnBeforePlayerCheckCard: "Func / (RoomData) / return RoomData",
    // 玩家过牌后
    OnAfterPlayerCheckCard: "Func / (RoomData) / return RoomData",
    // 玩家使用卡牌前
    OnBeforePlayerUseCard: "Func / (RoomData) / return RoomData",
    // 玩家使用卡牌后
    OnAfterPlayerUseCard: "Func / (RoomData) / return RoomData",
     // 判定阶段开始前
    OnBeforeJudgeStage: "Func / (RoomData) / return RoomData",
    // 判定阶段结束后
    OnAfterJudgeStage: "Func / (RoomData) / return RoomData",
    // 结算阶段开始前
    OnBeforeCalculateStage: "Func / (RoomData) / return RoomData",
    // 结算阶段结束后
    OnAfterCalculateStage: "Func / (RoomData) / return RoomData",
}
```

## Fighter
```json
{
    Id: "int / 角斗士编号",
    Name: "String / 名称",
    Desc: "String / 描述",
    InitHealth: "int / 初始生命值",
    InitMagic: "int / 初始魔法值",
    Health: "int / 临时生命值",
    Magic: "int / 临时魔法值",
    ConstBuffList: ["String / 角斗士永久BUFF词条"],
    TempBuffList: ["String / 角斗士临时BUFF词条"],
    InitConstBuffList: ["String / 初始角斗士永久BUFF词条"],
    InitTempBuffList: ["String / 初始角斗士临时BUFF词条"],
    CreditFactor: "int / 赏金倍率",
    InitCreditFactor: "int / 初始赏金倍率",
    BetDetails: [{
        BetPlayerIndex: "String / 下注的玩家编号",
        BetCredit: "int / 下注的金额"
    }]
}
```