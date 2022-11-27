<template>
    <div class="app">
        <div class="table">
            <div class="top_area">
                <transition-group
                    class = "other_player_area"
                    tag = "div"
                    :css = "false"
                    @enter="Enter"
                    @before-enter="BeforeEnter"
                    @after-enter="AfterEnter"
                >
                    <OtherPlayerInfo
                        v-for="(p, pIdx) in GameData.OtherPlayerList"
                        :key = "p.Index"
                        :index = "pIdx"
                        :TempCredit = "p.TempCredit"
                        :WinCredit = "p.WinCredit"
                        :PlayerIndex = "p.Index"
                        :HandCardsNum = "p.HandCardsNum"
                        :Status = "p.Status"
                    />
                </transition-group>

                <div class="room_info_area">
                    <RoomInfo
                        :CurrentRound = "GameData.CurrentRound"
                        :RoundNumLimit = "GameData.RoundNumLimit"
                        :PublicJackpot = "GameData.PublicJackpot"
                        :CurrentStage = "GameData.CurrentStage"
                    />
                </div>
            </div>

            
        </div>
    </div>
</template>

<script>

import OtherPlayerInfo from "../components/OtherPlayerInfo";
import RoomInfo from "../components/RoomInfo.vue";

export default {
    name: "GameTable",
    components: {
    OtherPlayerInfo,
    RoomInfo,
    RoomInfo
},

    data() 
    {
        return {
            // 前端展示设置
            MatchDialogShow: false,
            ShowCanvas: false,
            WindoeWidth: 1920,
            WindowHeight: 1080,
            
            UserUid: new Date().getTime(),
            CurrChosenHandCardId: -1,

            GameData: {
                // 服务器数据
                Index: -1,
                RoomNumber: "-1",
                FighterStatusList: [],
                PublicJackpot: 0,
                CurrentStage: "",
                CurrentRound: 0,
                RoundNumLimit: 0,
                CurrentPlayerIndex: -1,
                JudgerCardInfo: null,
                WinFighterId: -1,
                CurrTableCardIndex: -1,
                RankList: [],
                BetDetails: [],
                FighterInfoList: [],
                TableCardList: [],
                HandCards: [],                
                RemainCardsNum: -1,
                OtherPlayerList: [],
                MyInfo: null,
            }
        }
    },

    updated()
    {
        this.OtherPlayerAreaDom = document.querySelector(".other_player_area");
    },
    
    mounted()
    {
        // this.sockets = io.connect("http://localhost:4001");
        this.$socket.open();

        // 连接到房间
        this.$socket.emit("COMMAND", {
            type: "CONNECT_TO_ROOM",
            UserUid: this.UserUid,
        });
        // 队列等待中
        this.sockets.subscribe("WAITE", () => {
            this.MatchDialogShow = true;
        });
        // 重连到房间
        this.sockets.subscribe("RECONNECT_TO_ROOM", (result) => {
            this.gameData.RoomNumber = result.RoomNumber;
            this.gameData.Index = result.Index;
        });
        this.sockets.subscribe("RESTORE_DATA", (result) => {
            this.RestoreGameData(result);
        });
        // 初始化游戏数据
        this.sockets.subscribe("INIT_GAME_DATA", (result) => {
            this.SetInitGameData(result);
        });
        
    },

    // 重连到房间恢复数据
    RestoreGameData(result)
    {
        const {
            PublicJackpot, CurrentStage, FighterStatusList,
            CurrentRound, RoundNumLimit, CurrentPlayerIndex,
            JudgerCardInfo, FighterInfoList, TableCardList,
            HandCards, RemainCardsNum,
            MyInfos, OtherPlayerList
        } = result;
        this.GameData.PublicJackpot = PublicJackpot;
        this.GameData.CurrentStage = CurrentStage;
        this.GameData.FighterStatusList = FighterStatusList || [];
        this.GameData.CurrentRound = CurrentRound;
        this.GameData.RoundNumLimit = RoundNumLimit;
        this.GameData.CurrentPlayerIndex = CurrentPlayerIndex;
        this.GameData.JudgerCardInfo = JudgerCardInfo;
        this.GameData.FighterInfoList = FighterInfoList.sort(function(a, b){
            return parseFloat(a.Id) - parseFloat(b.Id);
        });
        this.GameData.TableCardList = TableCardList;
        this.GameData.HandCards = HandCards;
        this.GameData.RemainCardsNum = RemainCardsNum;
        this.GameData.MyInfos = MyInfos;
        this.GameData.OtherPlayerList = OtherPlayerList;
    },

    // 初始化游戏数据
    SetInitGameData(result)
    {
        const {
            PublicJackpot, CurrentStage, CurrentRound,
            RoundNumLimit, FighterStatusList, RoomNumber,
            CurrentPlayerIndex, JudgerCardInfo, FighterInfoList, 
            TableCardList, HandCards, RemainCardsNum,
            MyInfos, OtherPlayerList
        } = result;
        this.GameData.PublicJackpot = PublicJackpot;
        this.GameData.CurrentStage = CurrentStage;
        this.GameData.FighterStatusList = FighterStatusList || [];
        this.GameData.RoomNumber = RoomNumber;
        this.GameData.CurrentRound = CurrentRound;
        this.GameData.RoundNumLimit = RoundNumLimit;
        this.GameData.CurrentPlayerIndex = CurrentPlayerIndex;
        this.GameData.JudgerCardInfo = JudgerCardInfo;
        this.GameData.FighterInfoList = FighterInfoList.sort(function (a, b) {
            return parseFloat(a.id) - parseFloat(b.id);
        });
        this.GameData.BetDetails = [];
        this.GameData.TableCardList = TableCardList;
        this.GameData.HandCards = HandCards;
        this.GameData.RemainCardsNum = RemainCardsNum;
        this.GameData.MyInfos = MyInfos;
        this.GameData.Index = MyInfos.Index;
        this.GameData.OtherPlayerList = OtherPlayerList;
    },
}

</script>