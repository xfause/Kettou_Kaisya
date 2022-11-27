// 获取牌库中下一张手牌
function GetNextCard(RemainCards)
{
    if (RemainCards.length > 0) {
        return RemainCards.splice(0, 1)[0]
    } else {
        return null
    }
}

//发送数据给所有玩家
function SendInitDataToAllPlayer(GameData)
{
    const {
        Seed, 
        RandFunc, 
        FighterStatusList, 
        PublicJackpot, 
        CurrentStage, 
        CurrentRound, 
        CurrentPlayerIndex,
        JudgerCardInfo,
        FighterInfoList,
        TableCardList,
        PlayerList,
        RoomConfig
    } = GameData;
    PlayerList.map((p)=>{
        let cIndex = PlayerList.findIndex(obj => obj.UserUid == u.UserUid);
        let CurrPlayer = PlayerList[cIndex];
        let CurrentPlayerHandCards = CurrPlayer.HandCards;
        let CurrentPlayerRemainCardsNum = CurrPlayer.RemainCards.length;
        let CurrPlayerTempCredit = CurrPlayer.TempCredit;
        let CurrPlayerWinCredit = CurrPlayer.WinCredit;
        let CurrPlayerStatus = CurrPlayer.Status;
        let CurrPlayerConstBuffList = CurrPlayer.ConstBuffList;
        let CurrPlayerTempBuffList = CurrPlayer.TempBuffList;
        let CurrPlayerIndex = CurrPlayer.Index;
        let OtherPlayerList = [];
        PlayerList.map(op => {
            if (op.UserUid !== p.UserUid) {
                OtherPlayerList.push({
                    TempCredit: op.TempCredit,
                    WinCredit: op.WinCredit,
                    Index: op.Index,
                    HandCardNum: op.HandCards.length,
                    Status: op.Status,
                    ConstBuffList: op.ConstBuffList,
                    TempBuffList: op.TempBuffList,
                })
            };
        });

        p.Socket.emit("INIT_GAME_DATA", {
            Seed, RandFunc, PublicJackpot, CurrentStage, 
            CurrentRound, 
            RoundNumLimit: RoomConfig.RoundLimit,
            FighterStatusList,
            RoomNumber: GameData.RoomNumber,
            CurrentPlayerIndex,
            JudgerCardInfo, FighterInfoList, TableCardList,
            HandCards: CurrentPlayerHandCards,
            RemainCardsNum: CurrentPlayerRemainCardsNum,
            MyInfos: {
              TempCredit: CurrPlayerTempCredit,
              WinCredit: CurrPlayerWinCredit,
              Status: CurrPlayerStatus,
              ConstBuffList: CurrPlayerConstBuffList,
              TempBuffList: CurrPlayerTempBuffList,
              Index: CurrPlayerIndex,
            },
            OtherPlayerList
          })
    })
}

exports.GetNextCard = GetNextCard;
exports.SendInitDataToAllPlayer = SendInitDataToAllPlayer;