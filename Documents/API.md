```js
//下注角斗士
Client -> Server : "BET_ON_FIGHTER"
{
    RoomNumber,
    FighterId,
    PlayerIndex
}
Server -> Client : "AFTER_BET_ON_FIGHTER"
{
    IsSuccess：下注是否成功,
    // OUT_MAX_BET_COUNT / NOT_ENOUGH_TEMP_CREDIT
    ErrorMessage: 错误消息,
    BetPlayerIndex: 下注的玩家Index,
    Data:{
        PublicJackpot
        BetDetails
        FighterInfoList
        BetPlayerInfo:{
            Status
            TempCredit
        }
    }
}

// 卡牌效果生效 
Server -> Client "ACTIVE_CARD_EFFECT"
{
    Type:
        JUDGE_CARD_AFTER_PLAYER_BET_STAGE
        JUDGE_CARD_BEFORE_PLAYER_CHECK_CARD
        JUDGE_CARD_AFTER_PLAYER_CHECK_CARD
        JUDGE_CARD_BEFORE_PLAYER_FOLD_CARD
        JUDGE_CARD_AFTER_PLAYER_FOLD_CARD
        JUDGE_CARD_BEFORE_JUDGE_STAGE
        JUDGE_CARD_AFTER_JUDGE_STAGE
        HAND_CARD_AFTER_PLAYER_GET
        
    Data: Full Game Data
}

// 更改游戏阶段
Server -> Client "CHANGE_GAME_STAGE"
{
    CurrentStage
    PlayerStatus // 只有CARD阶段有
    CurrentPlayerIndex // 只有CARD阶段有
}

// 玩家结束下注
Client -> Server "PLAYER_END_BET_FIGHTERS"
{
    RoomNumber
    PlayerIndex
}
Server -> Client "AFTER_PLAYER_END_BET_FIGHTERS"
{
    PrevPlayerStatus
    PrevPlayerIndex
    CurrentPlayerIndex
}

// 玩家过牌
Client -> Server "PLAYER_CHECK_CARD"
{
    RoomNumber
    PlayerIndex
}
Server -> Client "AFTER_PLAYER_CHECK_CARD"
{
    IsSuccess：下注是否成功,
    // OUT_MAX_BET_COUNT / NOT_ENOUGH_TEMP_CREDIT
    ErrorMessage: 错误消息,
    Data:{
        // 当前玩家
        HandCards
        RemainCardsNum
        TempCredit
        PublicJackpot
        CurrentPlayerIndex
        PrevPlayerIndex
        // 非当前玩家
        PublicJackpot
        CurrentPlayerIndex
        PrevPlayerIndex
        PrevPlayerTempCredit
        PrevPlayerHandCardsNum
    }
}

// 发送获胜角斗士ID
Server -> Client "WIN_FIGHTER_ID"
{
    WinFighterId
}

// 玩家弃牌
Client -> Server "PLAYER_FOLD_CARD"
{
    RoomNumber
    PlayerIndex
}
```