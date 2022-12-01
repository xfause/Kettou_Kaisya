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
    }
}

function ConnectToRoom(args, socket, socketServer)
{
    const {UserUid} = args;
    // 玩家之前有未完成的游戏
    if (CacheUserPrevRoomNumber[UserUid])
    {
        let RoomNumber = CacheUserPrevRoomNumber[UserUid];
        let Player = CacheRoomsData[RoomNumber]["PlayerList"].map(v=>v.UserUid == UserUid)[0];
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

            CacheRoomsData[RoomNumber]["PlayerList"] = PlayerList;
            // 发送开始事件
            CacheRoomsData[RoomNumber]["PlayerList"].map(p => {
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
    GameData.CurrentPlayerIndex = CacheRoomsData[RoomNumber]["PlayerList"][0].Index;
    GameData.StartPlayerIndex = CacheRoomsData[RoomNumber]["PlayerList"][0].Index;
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
    GameData.PlayerList = CacheRoomsData[RoomNumber]["PlayerList"];
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