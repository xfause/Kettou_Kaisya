// 打包数据
function BundleData(Data, PlayerIndex) {
    const {
        PublicJackpot, CurrentStage, CurrentRound,
        RoomConfig, FighterStatusList, RoomNumber,
        CurrentPlayerIndex, JudgerCardInfo, FighterInfoList,
        TableCardList, PlayerList
    } = Data
    let res = {}
    res.PublicJackpot = PublicJackpot;
    res.CurrentStage = CurrentStage;
    res.CurrentRound = CurrentRound;
    res.RoomConfig = RoomConfig;
    res.FighterStatusList = FighterStatusList;
    res.CurrentPlayerIndex = CurrentPlayerIndex;
    res.JudgerCardInfo = JudgerCardInfo;
    res.FighterInfoList = FighterInfoList;
    res.TableCardList = TableCardList;

    let pIndex = PlayerList.findIndex(o => o.Index == PlayerIndex)
    if (pIndex != -1) {
        let player = PlayerList[pIndex];
        res.HandCards = player.HandCards;
        res.BetDetails = player.BetDetails;
        res.RemainCardsNum = player.RemainCards.length;
        res.RoomNumber = player.GameRoomNumber;
        res.MyInfos = {
            Index: player.Index,
            TempCredit: player.TempCredit,
            WinCredit: player.WinCredit,
            Status: player.Status,
            ConstBuffList: player.ConstBuffList,
            TempBuffList: player.TempBuffList,
        }
        res.Index = player.Index;
        res.OtherPlayerList = [];
        PlayerList.map(p => {
            if (p.Index !== PlayerIndex) {
                res.OtherPlayerList.push({
                    TempCredit: p.TempCredit,
                    WinCredit: p.WinCredit,
                    HandCardsNum: p.HandCards.length,
                    Index: p.Index,
                    Status: p.Status,
                    ConstBuffList: p.ConstBuffList,
                    TempBuffList: p.TempBuffList,
                });
            }
        })
    }
    return res;
}
// 下注阶段结束后翻开裁判牌 执行特殊效果
function ActiveJudgeCardAfterPlayerBetStage(GameData) {
    let TempGameData = { ...GameData };

    if (TempGameData.JudgerCardInfo.OnAfterPlayerBetStage != null &&
        TempGameData.JudgerCardInfo.OnAfterPlayerBetStage != undefined) {
        TempGameData = TempGameData.JudgerCardInfo.OnAfterPlayerBetStage(TempGameData);
    }
    TempGameData.PlayerList.map(p => {
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "JUDGE_CARD_AFTER_PLAYER_BET_STAGE",
            Data: BundleData(TempGameData, p.Index),
        });
    })
    return TempGameData;
}

// 玩家过牌前裁判牌特殊效果生效
function ActiveJudgeCardBeforePlayerCheckCard(GameData) {
    let TempGameData = { ...GameData };
    if (TempGameData.JudgerCardInfo.OnBeforePlayerCheckCard != null &&
        TempGameData.JudgerCardInfo.OnBeforePlayerCheckCard != undefined) {
        TempGameData = TempGameData.JudgerCardInfo.OnBeforePlayerCheckCard(TempGameData);
    }
    TempGameData.PlayerList.map(p => {
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "JUDGE_CARD_BEFORE_PLAYER_CHECK_CARD",
            Data: BundleData(TempGameData, p.Index),
        });
    })
    return TempGameData;
}

// 玩家过牌后裁判牌特殊效果生效
function ActiveJudgeCardAfterPlayerCheckCard(GameData) {
    let TempGameData = { ...GameData };
    if (TempGameData.JudgerCardInfo.OnAfterPlayerCheckCard != null &&
        TempGameData.JudgerCardInfo.OnAfterPlayerCheckCard != undefined) {
        TempGameData = TempGameData.JudgerCardInfo.OnAfterPlayerCheckCard(TempGameData);
    }
    TempGameData.PlayerList.map(p => {
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "JUDGE_CARD_AFTER_PLAYER_CHECK_CARD",
            Data: BundleData(TempGameData, p.Index),
        });
    })
    return TempGameData;
}

// 玩家获得卡牌后 卡牌特殊效果生效
function ActiveHandCardAfterPlayerGetCard(GameData, NewCard) {
    let TempGameData = { ...GameData };
    if (NewCard.OnAfterGetCard != null &&
        NewCard.OnAfterGetCard != undefined) {
        TempGameData = NewCard.OnAfterGetCard(TempGameData);
    }
    TempGameData.PlayerList.map(p => {
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "HAND_CARD_AFTER_PLAYER_GET",
            Data: BundleData(TempGameData, p.Index),
        });
    })
    return TempGameData;
}

// 玩家弃牌前裁判牌特殊效果生效
function ActiveJudgeCardBeforePlayerFoldCard(GameData) {
    let TempGameData = { ...GameData };
    if (TempGameData.JudgerCardInfo.OnBeforePlayerFoldCard != null &&
        TempGameData.JudgerCardInfo.OnBeforePlayerFoldCard != undefined) {
        TempGameData = TempGameData.JudgerCardInfo.OnBeforePlayerFoldCard(TempGameData);
    }
    TempGameData.PlayerList.map(p => {
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "JUDGE_CARD_BEFORE_PLAYER_FOLD_CARD",
            Data: BundleData(TempGameData, p.Index),
        });
    })
    return TempGameData;
}

// 玩家弃牌后裁判牌特殊效果生效
function ActiveJudgeCardAfterPlayerFoldCard(GameData) {
    let TempGameData = { ...GameData };
    if (TempGameData.JudgerCardInfo.OnAfterPlayerFoldCard != null &&
        TempGameData.JudgerCardInfo.OnAfterPlayerFoldCard != undefined) {
        TempGameData = TempGameData.JudgerCardInfo.OnAfterPlayerFoldCard(TempGameData);
    }
    TempGameData.PlayerList.map(p => {
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "JUDGE_CARD_AFTER_PLAYER_FOLD_CARD",
            Data: BundleData(TempGameData, p.Index),
        });
    })
    return TempGameData;
}

// 判定阶段开始前 裁判特殊效果生效
function ActiveJudgeCardBeforeJudgeStage(GameData) {
    let TempGameData = { ...GameData };
    if (TempGameData.JudgerCardInfo.OnBeforeJudgeStage != null &&
        TempGameData.JudgerCardInfo.OnBeforeJudgeStage != undefined) {
        TempGameData = TempGameData.JudgerCardInfo.OnBeforeJudgeStage(TempGameData);
    }
    TempGameData.PlayerList.map(p => {
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "JUDGE_CARD_BEFORE_JUDGE_STAGE",
            Data: BundleData(TempGameData, p.Index),
        });
    })
    return TempGameData;
}

// 判定阶段结束后 裁判特殊效果生效
function ActiveJudgeCardAfterJudgeStage(GameData) {
    let TempGameData = { ...GameData };
    if (TempGameData.JudgerCardInfo.OnAfterJudgeStage != null &&
        TempGameData.JudgerCardInfo.OnAfterJudgeStage != undefined) {
        TempGameData = TempGameData.JudgerCardInfo.OnAfterJudgeStage(TempGameData);
    }
    TempGameData.PlayerList.map(p => {
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "JUDGE_CARD_AFTER_JUDGE_STAGE",
            Data: BundleData(TempGameData, p.Index),
        });
    })
    return TempGameData;
}

// 结算阶段开始前 裁判特殊效果生效
function ActiveJudgeCardBeforeCalcStage(GameData) {
    let TempGameData = { ...GameData };
    if (TempGameData.JudgerCardInfo.OnBeforeCalculateStage != null &&
        TempGameData.JudgerCardInfo.OnBeforeCalculateStage != undefined) {
        TempGameData = TempGameData.JudgerCardInfo.OnBeforeCalculateStage(TempGameData);
    }
    TempGameData.PlayerList.map(p => {
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "JUDGE_CARD_BEFORE_CALC_STAGE",
            Data: BundleData(TempGameData, p.Index),
        });
    })
    return TempGameData;
}

// 结算阶段结束后 裁判特殊效果生效
function ActiveJudgeCardAfterCalcStage(GameData) {
    let TempGameData = { ...GameData };
    if (TempGameData.JudgerCardInfo.OnAfterCalculateStage != null &&
        TempGameData.JudgerCardInfo.OnAfterCalculateStage != undefined) {
        TempGameData = TempGameData.JudgerCardInfo.OnAfterCalculateStage(TempGameData);
    }
    TempGameData.PlayerList.map(p => {
        p.Socket.emit("ACTIVE_CARD_EFFECT", {
            Type: "JUDGE_CARD_AFTER_CALC_STAGE",
            Data: BundleData(TempGameData, p.Index),
        });
    })
    return TempGameData;
}

exports.ActiveJudgeCardAfterPlayerBetStage = ActiveJudgeCardAfterPlayerBetStage;
exports.ActiveJudgeCardBeforePlayerCheckCard = ActiveJudgeCardBeforePlayerCheckCard;
exports.ActiveJudgeCardAfterPlayerCheckCard = ActiveJudgeCardAfterPlayerCheckCard;
exports.ActiveJudgeCardBeforePlayerFoldCard = ActiveJudgeCardBeforePlayerFoldCard;
exports.ActiveJudgeCardAfterPlayerFoldCard = ActiveJudgeCardAfterPlayerFoldCard;
exports.ActiveHandCardAfterPlayerGetCard = ActiveHandCardAfterPlayerGetCard;
exports.ActiveJudgeCardBeforeJudgeStage = ActiveJudgeCardBeforeJudgeStage;
exports.ActiveJudgeCardAfterJudgeStage = ActiveJudgeCardAfterJudgeStage;
exports.ActiveJudgeCardBeforeCalcStage = ActiveJudgeCardBeforeCalcStage;
exports.ActiveJudgeCardAfterCalcStage = ActiveJudgeCardAfterCalcStage;