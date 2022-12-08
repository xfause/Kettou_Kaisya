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
function SendInitDataToAllPlayer(GameData, RoomNumber)
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
        let cIndex = PlayerList.findIndex(obj => obj.UserUid == p.UserUid);
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
            RoomConfig,
            FighterStatusList,
            RoomNumber: RoomNumber,
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

function GetNextPlayerIndex(CurrPlayerIndex, PlayerList, RoomPlayerLimit, Type="FOLDED")
{
    let times = 0;
    let pIndex = PlayerList.findIndex(obj => obj.Index == CurrPlayerIndex);
    while (PlayerList[pIndex].Status == Type && times < RoomPlayerLimit) {
        pIndex = (pIndex + 1) % (RoomPlayerLimit);
        times++;
    }
    return PlayerList[pIndex].Index;
}

function GetRandomNewJudger(JudgerList)
{
    let TmpJudgerList = [...JudgerList];
    var RandJudgerIndex = Math.floor(Math.random() * TmpJudgerList.length);
    return TmpJudgerList.splice(RandJudgerIndex, 1)[0];
}

function GetRandomNewFighters(FighterList, FighterCountLimit)
{
    let TmpFighterList = [...FighterList];
    for (let i = 0; i < TmpFighterList.length; i++){
        TmpFighterList[i].Health = TmpFighterList[i].InitHealth;
        TmpFighterList[i].Magic = TmpFighterList[i].InitMagic;
        TmpFighterList[i].ConstBuffList = TmpFighterList[i].InitConstBuffList;
        TmpFighterList[i].TempBuffList = TmpFighterList[i].InitTempBuffList;
        TmpFighterList[i].CreditFactor = TmpFighterList[i].InitCreditFactor;
        TmpFighterList[i].BetDetails = [];
    }
    let InitFighterList = [];
    for (let fIdx=0; fIdx < FighterCountLimit; fIdx++)
    {
        let randIdx = Math.floor(Math.random() * TmpFighterList.length);
        let f = TmpFighterList.splice(randIdx, 1)[0];
        Object.assign(f, {
            BetDetails: []
        })
        InitFighterList.push(f)
    }
    return InitFighterList;
}

exports.GetNextCard = GetNextCard;
exports.SendInitDataToAllPlayer = SendInitDataToAllPlayer;
exports.GetNextPlayerIndex = GetNextPlayerIndex;
exports.GetRandomNewJudger = GetRandomNewJudger;
exports.GetRandomNewFighters = GetRandomNewFighters;
