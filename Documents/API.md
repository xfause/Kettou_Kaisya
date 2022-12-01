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

// 更改游戏阶段
Server -> Client "CHANGE_GAME_STAGE"
{
    CurrentStage
    PlayerStatus // 只有CARD阶段有
    CurrentPlayerIndex // 只有CARD阶段有
}
```