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
// TODO
let ToolFuncs = require("./Scripts/Tools")
let UpdataCardEffect = require("./Scripts/UpdateCardEffect");

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
        case "PLAYER_CHECK_CARD":
            OnPlayerCheckCard(args, socket);
        case "PLAYER_FOLD_CARD":
            OnPlayerFoldCard(args, socket);
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
                p.Socket.emit("START", {
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
    let random = Math.floor(CacheRoomsData[RoomNumber].rand() * RoomPlayerLimit);
    let GameData = {};
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
    // 生成初始角斗士列表
    let TmpFighterList = [...FighterList];
    let InitFighterList = [];
    for (let fIdx=0; fIdx < GameData.RoomConfig.FighterCountLimit; fIdx++)
    {
        let randIdx = Math.floor(Math.random() * TmpFighterList.length);
        let f = TmpFighterList.splice(randIdx, 1)[0];
        Object.assign(f, {
            BetDetails: []
        })
        InitFighterList.push(f)
    }
    GameData.FighterInfoList = InitFighterList;
    // 添加裁判牌
    let TmpJudgerList = [...JudgerList];
    var RandJudgerIndex = Math.floor(Math.random() * TmpJudgerList.length);
    GameData.JudgerCardInfo = TmpJudgerList.splice(RandJudgerIndex, 1)[0];
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
    ToolFuncs.SendInitDataToAllPlayer(GameData);
}

function RestoreGameData(RoomNumber, UserUid)
{
    const GameData = CacheRoomsData[RoomNumber];
    const { 
        Seed, RandFunc, FighterStatusList, 
        PublicJackpot, CurrentStage, CurrentRound, 
        CurrentPlayerIndex, JudgerCardInfo, FighterInfoList,
        TableCardList, PlayerList, RoomConfig
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
        p.socket.emit("AFTER_BET_ON_FIGHTER", {
            IsSuccess: true,
            ErrorMessage: "",
            BetPlayerIndex: PlayerIndex,
            Data
        })
    })

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
        GameData.CurrentPlayerIndex = GameData.PlayerList[0].Index;
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

function OnPlayerEndBetFighters(args, socket)
{
    const {RoomNumber, PlayerIndex} = args;
    let PlayerIndexOfList = GameData.PlayerList.findIndex((obj => obj.Index == PlayerIndex));
    let GameData = CacheRoomsData[RoomNumber];

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
    var t = GetRandomNewCard(GameData.PlayerList[PlayerIndexOfList].RemainCards)
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
    GameData.CurrentPlayerIndex = GetNextPlayerIndex(
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
            CurrentStage,
        })
      });
    // 判定阶段结束 进入结算阶段
    OnCalcStage(RoomNumber)
}

function OnCalcStage(RoomNumber)
{
    let GameData = CacheRoomsData[RoomNumber];

    GameData = UpdataCardEffect.ActiveJudgeCardBeforeCalcStage(GameData);

    // 计算获胜角斗士ID
    let WinFighterId = GetWinFighterId(GameData);

    GameData.PlayerList.map(p=>{
        p.Socket.emit("WIN_FIGHTER_ID", {
            WinFighterId
        })
    })

    CacheRoomsData[RoomNumber] = GameData;

    // 计算WinCredit和TempCredit
    CalculateCredit(RoomNumber, WinFighterId);

    GameData = CacheRoomsData[RoomNumber];
    GameData = UpdataCardEffect.ActiveJudgeCardAfterCalcStage(GameData);
    CacheRoomsData[RoomNumber] = GameData;

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

function CalculateCredit(RoomNumber, WinFighterId)
{
    let GameData = CacheRoomsData[RoomNumber]
    //TODO



    CacheRoomsData[RoomNumber] = GameData;
}

function OnGameEnd(RoomNumber)
{
    let GameData = CacheRoomsData[RoomNumber];
    // TODO
}

function InitNewRound(RoomNumber)
{
    let GameData = CacheRoomsData[RoomNumber];
    // TODO
}