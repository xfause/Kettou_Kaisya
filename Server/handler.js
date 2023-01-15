// Import tools
const { shuffle } = require("./utils");
const uuidv4 = require('uuid/v4');
const seedrandom = require("seedrandom");

// Import Resources
const {
    FighterList,
    FighterStatusList
} = require("./Resources/FighterList");

const {
    JudgerList
} = require("./Resources/JudgerList");

const {
    CardList
} = require("./Resources/CardList");

const {
    NormalConfig
} = require("./Resources/RoomConfig");

// Import functionality
let ToolFuncs = require("./Scripts/Tools")
let UpdataCardEffect = require("./Scripts/UpdateCardEffect");
let BattleField = require("./Scripts/BattleField");

// Server Data
const WaitPairQueue = []; // 等待排序的队列
const CacheRoomsData = {}; //缓存的房间游戏数据 key:房间号 / value:游戏数据
const CacheUserPrevRoomNumber = {}; // 缓存用户的房间号 key:用户ID / value:房间号

// Server Logic

module.exports = function handleSynchronousClient(args, socket, socketServer)
{
    switch (args.type) 
    {
        // 玩家连接到游戏
        case "CONNECT_TO_ROOM":
            ConnectToRoom(args, socket, socketServer);
          break;
        case "BET_ON_FIGHTER":
            OnBetFighter(args, socket);
            break;
        case "PLAYER_END_BET_FIGHTERS":
            OnPlayerEndBetFighters(args, socket);
            break;
        case "PLAYER_CHECK_CARD":
            OnPlayerCheckCard(args, socket);
            break;
        case "PLAYER_FOLD_CARD":
            OnPlayerFoldCard(args, socket);
            break;
        case "PLAYER_USE_CARD":
            OnPlayerUseCard(args, socket);
    }
}

function ConnectToRoom(args, socket, socketServer)
{
    const {UserUid} = args;
    // 玩家之前有未完成的游戏
    if (CacheUserPrevRoomNumber[UserUid])
    {
        let RoomNumber = CacheUserPrevRoomNumber[UserUid];
        let Player = CacheRoomsData[RoomNumber].PlayerList.map(v=>v.UserUid == UserUid)[0];
        Player.Socket = socket;

        Player.Socket.emit("RECONNECT_TO_ROOM", {
            RoomNumber: RoomNumber,
            Index: Player.Index,
            RoomConfig: CacheRoomsData[RoomNumber].RoomConfig
        });
        // 恢复牌桌数据
        RestoreGameData(RoomNumber, UserUid);
    }
    else
    {
        //进入排队队列
        socket.emit("WAITE");
        const { RoomPlayerLimit } = NormalConfig;
        if (WaitPairQueue.length < RoomPlayerLimit - 1) 
        {
            WaitPairQueue.push({
                UserUid, 
                Socket: socket
            });
            socket.emit("WAITE");
        }
        else
        {
            // 创建新房间
            // 初始化服务数据
            let RoomNumber = uuidv4();
            let Seed = Math.floor(Math.random() * 10000);
            CacheRoomsData[RoomNumber] = {
                Seed,
                RandFunc: seedrandom(Seed),
                FighterStatusList,
                RoomConfig: NormalConfig
            }

            let PlayerList = [];
            for (let qIdx = 0; qIdx < RoomPlayerLimit-1; qIdx++)
            {
                let p = WaitPairQueue.splice(0, 1)[0];
                p.RoomNumber = RoomNumber;
                CacheUserPrevRoomNumber[p.UserUid] = RoomNumber;
                p.Socket.join(RoomNumber);
                p.Index = qIdx;
                p.Status = "NOT_BETED";
                PlayerList.push(p);
            }
            CacheUserPrevRoomNumber[UserUid] = RoomNumber;
            socket.join(RoomNumber);
            PlayerList.push({
                UserUid, 
                Socket: socket, 
                RoomNumber, 
                Index: RoomPlayerLimit,
                Status: "NOT_BETED",
            });

            CacheRoomsData[RoomNumber].PlayerList = PlayerList;
            // 发送开始事件
            CacheRoomsData[RoomNumber].PlayerList.map(p => {
                p.Socket.emit("GAME_START", {
                    RoomNumber,
                    Index: p.Index,
                });
            });
            // 初始化局内数据
            InitGameData(RoomNumber);
        }
    }
}

// 初始化游戏数据
function InitGameData(RoomNumber)
{
    let GameData = {};
    GameData.BattleField = new BattleField();
    GameData.Seed = CacheRoomsData[RoomNumber].Seed;
    GameData.RandFunc = CacheRoomsData[RoomNumber].RandFunc;
    GameData.FighterStatusList = CacheRoomsData[RoomNumber].FighterStatusList;
    GameData.RoomConfig = CacheRoomsData[RoomNumber].RoomConfig;
    // 下注顺序
    GameData.CurrentPlayerIndex = CacheRoomsData[RoomNumber].PlayerList[0].Index;
    GameData.StartPlayerIndex = CacheRoomsData[RoomNumber].PlayerList[0].Index;
    GameData.CurrentRound = 1;
    GameData.PublicJackpot = 0;
    GameData.CurrentStage = "BET";
    GameData.WinFighterId = -1;
    // 生成初始角斗士列表
    GameData.FighterInfoList = [...ToolFuncs.GetRandomNewFighters(FighterList, GameData.RoomConfig.FighterCountLimit)];
    // 添加裁判牌
    GameData.JudgerCardInfo = ToolFuncs.GetRandomNewJudger(JudgerList);
    GameData.JudgerCardInfo.IsActive = false;
    // 清空桌面牌队列
    GameData.TableCardList = [];
    // 初始化玩家数据
    GameData.PlayerList = CacheRoomsData[RoomNumber].PlayerList;
    GameData.PlayerList.map(p=>{
        p.GameRoomNumber = RoomNumber;
        p.Status = "NOT_BETED";
        p.ConstBuffList = [];
        p.TempBuffList = [];
        p.BetDetails = [];
        p.TempCredit = GameData.RoomConfig.RoundInitCredit;
        p.WinCredit = 0;
        // 获取初始手牌
        p.HandCards = [];
        p.RemainCards = shuffle(GameData.RandFunc, CardList.map((c, index) => Object.assign({ k: index }, c)));
        for (let cIdx = 0; cIdx < GameData.RoomConfig.InitHandCardCount; cIdx++) {
            let card = ToolFuncs.GetNextCard(p.RemainCards)
            if (card !== null) {
                p.HandCards.push(card);
            }
        }
    });
    // 重新缓存
    CacheRoomsData[RoomNumber] = GameData;
    // 发送数据给所有玩家
    ToolFuncs.SendInitDataToAllPlayer(GameData, RoomNumber);
}

function RestoreGameData(RoomNumber, UserUid)
{
    const GameData = CacheRoomsData[RoomNumber];
    const { 
        Seed, RandFunc, FighterStatusList, 
        PublicJackpot, CurrentStage, CurrentRound, 
        CurrentPlayerIndex, JudgerCardInfo, FighterInfoList,
        TableCardList, PlayerList, RoomConfig, WinFighterId
    } = GameData;

    let player =PlayerList.map(p => p.UserUid === UserUid)[0];
    let OtherPlayerList = [];
    PlayerList.map(p => p.userId !== u.userId).map(op => {
        OtherPlayerList.push({
            TempCredit: op.TempCredit,
            WinCredit: op.WinCredit,
            HandCardsNum: op.HandCards.length,
            Index: op.Index,
            Status: op.Status,
            ConstBuffList: op.ConstBuffList,
            TempBuffList: op.TempBuffList,
        });
    })
    player.Socket.emit("RESTORE_DATA", {
        Seed, RandFunc, PublicJackpot, CurrentStage, 
        CurrentRound, FighterStatusList, CurrentPlayerIndex,
        RoomConfig, JudgerCardInfo, FighterInfoList, TableCardList,
        WinFighterId,
        HandCards: player.HandCards,
        RemainCardsNum: player.RemainCards.length,
        MyInfos: {
            TempCredit: player.TempCredit,
            WinCredit: player.WinCredit,
            Status: player.Status,
            ConstBuffList: player.ConstBuffList,
            TempBuffList: player.TempBuffList,
            Index: player.Index,
        },
        OtherPlayerList,
    });
}

function OnBetFighter(args, socket)
{
    let { RoomNumber, FighterId, PlayerIndex} = args;
    let GameData = CacheRoomsData[RoomNumber];

    let PlayerIndexOfList = GameData.PlayerList.findIndex((obj => obj.Index == PlayerIndex));
    let BetCredit = GameData.RoomConfig.MinBetCredit;

    // 临时资金不够下注
    if (GameData.PlayerList[PlayerIndexOfList].TempCredit < GameData.RoomConfig.MinBetCredit)
    {
        GameData.PlayerList[PlayerIndexOfList].map(p=>{
            p.Socket.emit("AFTER_BET_ON_FIGHTER",{
                IsSuccess: false,
                ErrorMessage: "NOT_ENOUGH_TEMP_CREDIT",
                BetPlayerIndex: PlayerIndex,
                Data:{}
            });
            
        })
        return;
    }
    // 已经下注超过三名角斗士
    if (GameData.PlayerList[PlayerIndexOfList].BetDetails.length == 3)
    {   
        GameData.PlayerList[PlayerIndexOfList].map(p=>{
            p.Socket.emit("AFTER_BET_ON_FIGHTER",{
                IsSuccess: false,
                ErrorMessage: "OUT_MAX_BET_COUNT",
                BetPlayerIndex: PlayerIndex,
                Data:{}
            });
            
        })
        return;
    }
    let mBetIndex = GameData.PlayerList[PlayerIndexOfList].BetDetails.findIndex((b => b.FighterId == FighterId));
    if (mBetIndex == -1)
    {
        // 没有下注过给这个角斗士
        GameData.PlayerList[PlayerIndexOfList].BetDetails.push({
            FighterId, BetCredit
        });
    }
    else
    {
        //下注过给这个角斗士
        GameData.PlayerList[PlayerIndexOfList].BetDetails[mBetIndex].BetCredit += BetCredit;
    }
    
    // 把下注资金加入公共奖池
    GameData.PublicJackpot += BetCredit;
    GameData.PlayerList[PlayerIndexOfList].TempCredit -= BetCredit;
    // 下注超过3个 修改玩家状态
    if (GameData.PlayerList[PlayerIndexOfList].BetDetails.length == 3) {
        GameData.PlayerList[PlayerIndexOfList].Status = "BETED";
    }
    // 修改Fighter结构里的BetDetails
    let fIndex = GameData.FighterInfoList.findIndex((f => f.Id == FighterId));
    let pIdxInFighterBetDetails = GameData.FighterInfoList[fIndex].BetDetails.findIndex((b => b.BetPlayerIndex == PlayerIndex));
    if (pIdxInFighterBetDetails == -1)
    {
        // 该角斗士第一次被该玩家下注
        GameData.FighterInfoList[fIndex].BetDetails.push({
            FighterId, BetCredit
        });
    }
    else
    {
        GameData.FighterInfoList[fIndex].BetDetails[pIdxInFighterBetDetails].BetCredit += BetCredit;
    }
    // 发送修改后的数据给所有玩家
    GameData.PlayerList.map(p => {
        let Data = {
            PublicJackpot: GameData.PublicJackpot,
            BetDetails: GameData.PlayerList[PlayerIndexOfList].BetDetails,
            FighterInfoList:GameData.FighterInfoList,
            BetPlayerInfo : {
                Status: GameData.PlayerList[PlayerIndexOfList].Status,
                TempCredit : GameData.PlayerList[PlayerIndexOfList].TempCredit,
            }
        }
        p.Socket.emit("AFTER_BET_ON_FIGHTER", {
            IsSuccess: true,
            ErrorMessage: "",
            BetPlayerIndex: PlayerIndex,
            Data
        })
    })

    CacheRoomsData[RoomNumber] = GameData;
}

function OnPlayerEndBetFighters(args, socket)
{
    const {RoomNumber, PlayerIndex} = args;
    let GameData = CacheRoomsData[RoomNumber];
    let PlayerIndexOfList = GameData.PlayerList.findIndex((obj => obj.Index == PlayerIndex));

    GameData.PlayerList[PlayerIndexOfList].Status = "BETED";
    GameData.CurrentPlayerIndex = 
        ToolFuncs.GetNextPlayerIndex(
            GameData.CurrentPlayerIndex,
            GameData.PlayerList,
            GameData.RoomConfig.RoomPlayerLimit,
            "BETED"
        );
    GameData.PlayerList.map((p)=>{
        p.Socket.emit("AFTER_PLAYER_END_BET_FIGHTERS", {
            PrevPlayerStatus: GameData.PlayerList[PlayerIndexOfList].Status,
            PrevPlayerIndex: PlayerIndex,
            CurrentPlayerIndex: GameData.CurrentPlayerIndex,
        });
    });

    // 统计已下注人数
    let BetPlayerCount = 0;
    GameData.PlayerList.map(p => {
        if (p.Status === "BETED") {
            BetPlayerCount += 1;
        }
    })
    if (BetPlayerCount == GameData.RoomConfig.RoomPlayerLimit)
    {
        // 下注阶段结束后翻开裁判牌 执行特殊效果
        GameData.JudgerCardInfo.IsActive = true;
        GameData = UpdataCardEffect.ActiveJudgeCardAfterPlayerBetStage(GameData);
        // 进入出牌阶段
        GameData.CurrentStage = "CARD";
        // TODO: 出牌玩家顺序应该变更 目前为固定从最先进入房间的玩家开始
        // GameData.CurrentPlayerIndex = GameData.PlayerList[0].Index;
        GameData.PlayerList.map(p=>{
            p.Status = "NOT_FOLDED";
            p.Socket.emit("CHANGE_GAME_STAGE", {
                CurrentStage: GameData.CurrentStage,
                PlayerStatus: p.Status,
                CurrentPlayerIndex: GameData.CurrentPlayerIndex
            });
        })
    }

    CacheRoomsData[RoomNumber] = GameData;
}

function OnPlayerCheckCard(args, socket)
{
    const {RoomNumber, PlayerIndex} = args;
    let GameData = CacheRoomsData[RoomNumber];

    GameData = UpdataCardEffect.ActiveJudgeCardBeforePlayerCheckCard(GameData);

    let PlayerIndexOfList = GameData.PlayerList.findIndex((obj => obj.Index == PlayerIndex));

    //合法性判断
    if (GameData.PlayerList[PlayerIndexOfList].TempCredit < GameData.RoomConfig.CheckCardCost)
    {
        socket.emit("AFTER_PLAYER_CHECK_CARD", {
            IsSuccess: false,
            ErrorMessage: "NOT_ENOUGH_TEMPCREDIT",
            Data: {}
        })
    }
    if (GameData.PlayerList[PlayerIndexOfList].HandCards.length >= GameData.RoomConfig.HandCardCountLimit)
    {
        socket.emit("AFTER_PLAYER_CHECK_CARD", {
            IsSuccess: false,
            ErrorMessage: "HAND_CARD_NUM_OUT_LIMIT",
            Data: {}
        })
    }
    // 成功过牌
    GameData.PlayerList[PlayerIndexOfList].TempCredit -= GameData.RoomConfig.CheckCardCost;
    GameData.PublicJackpot += GameData.RoomConfig.CheckCardCost;
    GameData.CurrentPlayerIndex = 
        ToolFuncs.GetNextPlayerIndex(
            GameData.CurrentPlayerIndex,
            GameData.PlayerList,
            GameData.RoomConfig.RoomPlayerLimit,
        );
    var t = ToolFuncs.GetNextCard(GameData.PlayerList[PlayerIndexOfList].RemainCards)
    if (t !== null) {
        GameData.PlayerList[PlayerIndexOfList].HandCards.push(t);
    }
    // 玩家获得新手牌 效果生效
    GameData = UpdataCardEffect.ActiveHandCardAfterPlayerGetCard(GameData, t);

    GameData.PlayerList.map(p=>{
        if (p.Index == PlayerIndex){
            p.Socket.emit("AFTER_PLAYER_CHECK_CARD",{
                IsSuccess: true,
                ErrorMessage: "",
                Data:{
                    HandCards: GameData.PlayerList[PlayerIndexOfList].HandCards,
                    RemainCardsNum: GameData.PlayerList[PlayerIndexOfList].RemainCards.length,
                    TempCredit: GameData.PlayerList[PlayerIndexOfList].TempCredit,
                    PublicJackpot: GameData.PublicJackpot,
                    CurrentPlayerIndex: GameData.CurrentPlayerIndex
                }
            })
        }
        else
        {
            p.Socket.emit("AFTER_PLAYER_CHECK_CARD",{
                IsSuccess: true,
                ErrorMessage: "",
                Data:{
                    PublicJackpot: GameData.PublicJackpot,
                    CurrentPlayerIndex: GameData.CurrentPlayerIndex,
                    PrevPlayerIndex: PlayerIndex,
                    PrevPlayerTempCredit: GameData.PlayerList[PlayerIndexOfList].TempCredit,
                    PrevPlayerHandCardsNum: GameData.PlayerList[PlayerIndexOfList].HandCards.length
                }
            })
        }
    })

    GameData = UpdataCardEffect.ActiveJudgeCardAfterPlayerCheckCard(GameData);

    CacheRoomsData[RoomNumber] = GameData;
}

function OnPlayerFoldCard(args, socket)
{
    const {RoomNumber, PlayerIndex} = args;
    let GameData = CacheRoomsData[RoomNumber];

    GameData = UpdataCardEffect.ActiveJudgeCardBeforePlayerFoldCard(GameData);

    let PlayerIndexOfList = GameData.PlayerList.findIndex((obj => obj.Index == PlayerIndex));
    GameData.PlayerList[PlayerIndexOfList].Status = "FOLDED";
    GameData.CurrentPlayerIndex = ToolFuncs.GetNextPlayerIndex(
        GameData.CurrentPlayerIndex,
        GameData.PlayerList,
        GameData.RoomConfig.RoomPlayerLimit
    );

    GameData = UpdataCardEffect.ActiveJudgeCardAfterPlayerFoldCard(GameData);

    let FoldedPlayerNum = 0;
    GameData.PlayerList.map(p => {
        if (p.Status == "FOLDED") {
            FoldedPlayerNum++;
        }
    });

    if (FoldedPlayerNum == GameData.RoomConfig.RoomPlayerLimit) {
        GameData.CurrentStage = "JUDGE";
        GameData.PlayerList.map(p => {
            p.Socket.emit("CHANGE_GAME_STAGE", {
                CurrentStage: GameData.CurrentStage,
                PlayerStatus: p.Status,
                CurrentPlayerIndex: GameData.CurrentPlayerIndex
            });
        })

        CacheRoomsData[RoomNumber] = GameData;

        OnJudgeTableCards(RoomNumber);
    }
    else 
    {
        GameData.PlayerList.map(p => {
            p.Socket.emit("AFTER_PLAYER_FOLD_CARD", {
                IsSuccess: true,
                ErrorMessage: "",
                Data:{
                    CurrentPlayerIndex: GameData.CurrentPlayerIndex,
                    PrevPlayerIndex: PlayerIndex,
                    PrevPlayerStatus: GameData.PlayerList[PlayerIndexOfList].Status
                }
            })
        })
        CacheRoomsData[RoomNumber] = GameData;
    }
}

function OnPlayerUseCard(args, socket)
{
    const {RoomNumber, PlayerIndex, UsedCardId, UseInfo} = args;
    let GameData = CacheRoomsData[RoomNumber];
    let pIdx = GameData.PlayerList.findIndex(obj=> obj.Index == PlayerIndex);
    let cIdx = GameData.PlayerList[pIdx].HandCards.findIndex(obj=> obj.Id == UsedCardId);
    let UsedCard = GameData.PlayerList[pIdx].HandCards(cIdx);
    // 向使用信息中加入更多需要的信息
    UseInfo.PlayerIndex = PlayerIndex;
    
    GameData = GameData.BattleField.OnPlayerUseCard(
        GameData,
        UsedCard,
        UseInfo
    )
    // TODO: Send Updated Data
}

function OnJudgeTableCards(RoomNumber)
{
    let GameData = CacheRoomsData[RoomNumber];

    GameData = UpdataCardEffect.ActiveJudgeCardBeforeJudgeStage(GameData);

    //TODO: run all table cards
    // 需要每次更新一张牌都更新数据

    GameData = UpdataCardEffect.ActiveJudgeCardAfterJudgeStage(GameData);

    GameData.CurrentStage = "CALC";
    CacheRoomsData[RoomNumber] = GameData;

    GameData.PlayerList.map(p => {
        p.Socket.emit("CHANGE_GAME_STAGE", {
            CurrentStage: GameData.CurrentStage,
        })
      });
    // 判定阶段结束 进入结算阶段
    OnCalcStage(RoomNumber)
}

// 判定阶段结束 进入结算阶段
function OnCalcStage(RoomNumber)
{
    let GameData = CacheRoomsData[RoomNumber];

    GameData = UpdataCardEffect.ActiveJudgeCardBeforeCalcStage(GameData);

    // 计算获胜角斗士ID
    let WinFighterId = GetWinFighterId(GameData);

    CacheRoomsData[RoomNumber].WinFighterId = WinFighterId;

    CacheRoomsData[RoomNumber] = UpdataCardEffect.ActiveJudgeCardAfterCalcStage(CacheRoomsData[RoomNumber]);

    GameData.PlayerList.map(p=>{
        p.Socket.emit("WIN_FIGHTER_ID", {
            WinFighterId: CacheRoomsData[RoomNumber].WinFighterId
        })
    })

    // 计算WinCredit和TempCredit
    CalculateCredit(RoomNumber, CacheRoomsData[RoomNumber].WinFighterId);

    GameData = CacheRoomsData[RoomNumber]
    if (GameData.CurrentRound == GameData.RoomConfig.RoundLimit)
    {
        // 游戏结束
        OnGameEnd(RoomNumber)
    }
    else
    {
        // 初始化下一回合数据
        InitNewRound(RoomNumber)
    }

}

// 计算获胜角斗士ID
function GetWinFighterId(GameData)
{
    let WinFighterIndex = 0;
    let MaxHealth = -99999;
    for (let i = 0; i < GameData.FighterInfoList.length; i++) {
    if (GameData.FighterInfoList[i].Health > MaxHealth) {
            WinFighterIndex = i;
            MaxHealth = GameData.FighterInfoList[i].Health;
        }
    }
    return GameData.FighterInfoList[WinFighterIndex].Id;
}

// 计算WinCredit和TempCredit
function CalculateCredit(RoomNumber, WinFighterId)
{
    let GameData = CacheRoomsData[RoomNumber];
    let WinFighterIndexInList = GameData.FighterInfoList.findIndex(b=>b.Id == WinFighterId);
    let WinFighterInfo = GameData.FighterInfoList[WinFighterIndexInList];
    let RoundRankList = [];
    
    // 统计下注收益
    GameData.PlayerList.map(player=>{
        let TempBetCredit = 0;
        let bIsBetOnWinFighterIndex = player.BetDetails.findIndex(b=>b.FighterId == WinFighterId);
        if (bIsBetOnWinFighterIndex != -1)
        {
            let BetDetail = player.BetDetails[bIsBetOnWinFighterIndex];
            switch (player.BetDetails.length) {
                case 3:
                    TempBetCredit = 1.0;
                    break;
                case 2:
                    TempBetCredit = 1.5;
                    break;
                case 1:
                    TempBetCredit = 2.0;
                default:
                    break;
            }
            RoundRankList.push({
                PlayerIndex: player.Index,
                TempBetCredit: TempBetCredit * BetDetail.BetCredit * WinFighterInfo.CreditFactor,
                TotalWinCredit: player.WinCredit,
                TempWinCredit: 0,
                Rank: -1,
            })
        }
        else
        {
            RoundRankList.push({
                PlayerIndex: player.Index,
                TempBetCredit: 0,
                TotalWinCredit: player.WinCredit
            })
        }
    })

    
    // 统计公共奖池收益
    let BetCorrectPlayerCount = 0
    RoundRankList.map(r=>{
        if (r.TempBetCredit !== 0)
        {
            BetCorrectPlayerCount++;
        }
    })
    RoundRankList.map(pb=>{
        if (pb.TempBetCredit !== 0)
        {
            pb.TempBetCredit += GameData.PublicJackpot / BetCorrectPlayerCount
        }
    })

    // 累加剩余资金
    GameData.PlayerList.map(player=>{
        let bIsPlayerCorrect = RoundRankList.findIndex(b=>b.PlayerIndex == player.Index);
        if (bIsPlayerCorrect != -1)
        {
            RoundRankList[bIsPlayerCorrect].TempBetCredit += player.TempCredit;
        }
        else
        {
            RoundRankList.push({
                PlayerIndex: player.Index,
                TempBetCredit: player.TempBetCredit,
                TotalWinCredit: player.WinCredit,
                TempWinCredit: 0,
                Rank: -1,
            })
        }
    })

    //计算胜点
    RoundRankList.sort((a, b)=>{
        return parseFloat(a.TempBetCredit) - parseFloat(b.TempBetCredit);
    });
    RoundRankList.map((obj, index)=>{
        let pIndex = GameData.PlayerList.findIndex(p=>p.Index == obj.PlayerIndex);
        if (index < GameData.RoomConfig.WinCreditForRank.length)
        {
            let Credit = GameData.RoomConfig.WinCreditForRank[index];
            RoundRankList[index].TempWinCredit = Credit;
            RoundRankList[index].TotalWinCredit += Credit;
            RoundRankList[index].Rank = index + 1,
            GameData.PlayerList[pIndex].WinCredit += Credit;
        }
        else 
        {
            RoundRankList[index].TempWinCredit = 0;
            RoundRankList[index].TotalWinCredit += 0;
            RoundRankList[index].Rank = index + 1,
            GameData.PlayerList[pIndex].WinCredit += 0;
        }
    })
    GameData.PlayerList.map(p=>{
        p.Socket.emit("SETTLE_IN_ROUND",{
            RoundRankList
        })
    })

    CacheRoomsData[RoomNumber] = GameData;
}

// 游戏结束
function OnGameEnd(RoomNumber)
{
    let GameData = CacheRoomsData[RoomNumber];
    let RankList = [];
    GameData.PlayerList.map(p=>{
        RankList.push({
            PlayerIndex: p.Index,
            WinCredit: p.WinCredit
        })
    })
    RankList.sort((a, b)=>{
        return parseFloat(a.WinCredit) - parseFloat(b.WinCredit);
    });
    RankList.map((r, index)=>{
        r.Rank = index+1;
    })
    GameData.PlayerList.map(p=>{
        p.Socket.emit("SETTLE_ON_GAME_END", {
            RankList
        })
    })

    CacheRoomsData[RoomNumber] = GameData;
}

// 初始化下一回合数据
function InitNewRound(RoomNumber)
{
    let GameData = CacheRoomsData[RoomNumber];

    GameData.CurrentRound ++;
    GameData.CurrentStage = "BET";
    GameData.WinFighterId = -1;
    GameData.StartPlayerIndex = GameData.PlayerList[(GameData.StartPlayerIndex + 1) % GameData.RoomConfig.RoomPlayerLimit].Index;
    GameData.CurrentPlayerIndex = GameData.StartPlayerIndex;
    GameData.JudgerCardInfo = ToolFuncs.GetRandomNewJudger(JudgerList);
    GameData.JudgerCardInfo.IsActive = false;
    GameData.PublicJackpot = 0;
    GameData.TableCardList = [];
    GameData.FighterInfoList = [...ToolFuncs.GetRandomNewFighters(FighterList, GameData.RoomConfig.FighterCountLimit)];

    GameData.PlayerList.map(p=>{
        p.Status ="NOT_BETED";
        p.BetDetails = [];
        p.TempCredit = GameData.RoomConfig.RoundInitCredit;
        p.HandCards = [];
        p.RemainCards = shuffle(GameData.RandFunc, CardList.map((c, index) => Object.assign({ k: index }, c)));
        for (let cIdx = 0; cIdx < GameData.RoomConfig.InitHandCardCount; cIdx++) {
            let card = ToolFuncs.GetNextCard(p.RemainCards)
            if (card !== null) {
                p.HandCards.push(card);
            }
        }
    })

    CacheRoomsData[RoomNumber] = GameData;
    ToolFuncs.SendInitDataToAllPlayer(GameData, RoomNumber);
}