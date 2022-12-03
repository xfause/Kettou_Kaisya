
// 下注阶段结束后翻开裁判牌 执行特殊效果
function ActiveJudgeCardAfterPlayerBetStage(GameData)
{
    let TempGameData = GameData;
    if (TempGameData.JudgerCardInfo.OnAfterPlayerBetStage != null)
    {
        TempGameData = TempGameData.JudgerCardInfo.OnAfterPlayerBetStage(TempGameData);
    }
    TempGameData.PlayerList.map(p=>{
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "JUDGE_CARD_AFTER_PLAYER_BET_STAGE",
            Data: TempGameData,
        });
    })
    return TempGameData;
}

// 玩家过牌前裁判牌特殊效果生效
function ActiveJudgeCardBeforePlayerCheckCard(GameData)
{
    let TempGameData = GameData;
    if (TempGameData.JudgerCardInfo.OnBeforePlayerCheckCard != null)
    {
        TempGameData = TempGameData.JudgerCardInfo.OnBeforePlayerCheckCard(TempGameData);
    }
    TempGameData.PlayerList.map(p=>{
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "JUDGE_CARD_BEFORE_PLAYER_CHECK_CARD",
            Data: TempGameData,
        });
    })
    return TempGameData;
}

// 玩家获得卡牌后 卡牌特殊效果生效
function ActiveHandCardAfterPlayerGetCard(GameData, NewCard)
{
    let TempGameData = GameData;
    if (NewCard.OnAfterGetCard != null)
    {
        TempGameData = NewCard.OnAfterGetCard(TempGameData);
    }
    TempGameData.PlayerList.map(p=>{
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "HAND_CARD_AFTER_PLAYER_GET",
            Data: TempGameData,
        });
    })
    return TempGameData;
}

exports.ActiveJudgeCardAfterPlayerBetStage = ActiveJudgeCardAfterPlayerBetStage;
exports.ActiveJudgeCardBeforePlayerCheckCard = ActiveJudgeCardBeforePlayerCheckCard;
exports.ActiveHandCardAfterPlayerGetCard = ActiveHandCardAfterPlayerGetCard;