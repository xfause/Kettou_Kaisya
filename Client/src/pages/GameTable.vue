<template>
    <div class="app">
        <div class="table">
            <div class="top_area">
                <transition-group 
                    class="other_player_area" 
                    tag="div" 
                    :css="false" 
                    @enter="CustomMouseEnter"
                    @before-enter="CustomBeforeMouseEnter" 
                    @after-enter="CustomAfterMouseEnter"
                >
                    <OtherPlayerInfo 
                        v-for="(p, pIdx) in GameData.OtherPlayerList" 
                        :key="p.Index" 
                        :index="pIdx"
                        :TempCredit="p.TempCredit" 
                        :WinCredit="p.WinCredit" 
                        :PlayerIndex="p.Index"
                        :HandCardsNum="p.HandCardsNum" 
                        :Status="p.Status"
                    />
                </transition-group>

                <div class="room_info_area">
                    <RoomInfo 
                        :CurrentRound="GameData.CurrentRound" 
                        :RoundNumLimit="GameData.RoundNumLimit"
                        :PublicJackpot="GameData.PublicJackpot" 
                        :CurrentStage="GameData.CurrentStage" 
                    />
                </div>
            </div>

            <div class="table_area">
                <div class="judger_card_area">
                    <JudgerCard 
                        :JudgerCard="GameData.JudgerCardInfo" 
                        :CurrentStage="GameData.CurrentStage" 
                    />
                </div>

                <transition-group 
                    class="fighter_list_area" 
                    tag="div" 
                    :css="false" 
                    @enter="CustomMouseEnter"
                    @before-enter="CustomBeforeMouseEnter" 
                    @after-enter="CustomAfterMouseEnter"
                >
                    <FighterCard 
                        v-for="f in GameData.FighterInfoList" 
                        :key="f.Id" 
                        :index="f.Id" 
                        :data-id="f.Id"
                        :PlayerStatus="GameData.MyInfos.Status" 
                        :GameCurrStage="GameData.CurrentStage"
                        :PlayerIndex="GameData.Index" 
                        :CurrentPlayerIndex="GameData.CurrentPlayerIndex"
                        :RoomNumber="GameData.RoomNumber" 
                        :FighterStatusList="GameData.FighterStatusList"
                        :PlayerTempCredit="GameData.MyInfos.TempCredit" 
                        :BetDetails="GameData.BetDetails"
                        :FighterBetDetails="GetFighterBetDetails(f.Id)" 
                        :Fighter="f" 
                    />
                </transition-group>

                <transition-group 
                    class="table_cards_area" 
                    tag="div" 
                    :css="false" 
                    @enter="CustomMouseEnter"
                    @before-enter="CustomBeforeMouseEnter" 
                    @after-enter="CustomAfterMouseEnter"
                >
                    <TableCard 
                        :key="card.k" 
                        :index="index" 
                        :data-id="index" 
                        :data="card"
                        :CurrentStage="GameData.CurrentStage" 
                        :CurrentTableCardIndex="GameData.CurrTableCardIndex"
                        :CardIndex="index" 
                        v-for="(card, index) in GameData.TableCardList" 
                    />
                </transition-group>
            </div>

            <div class="player_area">
                <div class="player_basic_info">
                    <PlayerBasicInfo
                        v-if="GameData.MyInfos"
                        :PlayerIndex="GameData.MyInfos.Index"
                        :Status="GameData.MyInfos.Status"
                        :TempCredit="GameData.MyInfos.TempCredit"
                        :WinCredit="GameData.MyInfos.WinCredit"
                        :CurrentStage="GameData.CurrentStage"
                        :BetDetails="GameData.BetDetails"
                        :RoomNumber="GameData.RoomNumber"
                        :CurrentPlayerIndex="GameData.CurrentPlayerIndex"
                        :CheckCardCost="GameConfig.CheckCardCost"
                    />
                </div>
            </div>

            <div class="match-dialog-container" v-show="IsShowSearchMatchDialog">
                正在匹配，请等待
            </div>

            <canvas id="animationCanvas" v-show="IsShowAnimCanvas" :width="WindoeWidth" :height="WindowHeight">
            </canvas>
        </div>
    </div>
</template>

<script>
import Velocity from "velocity-animate";

import OtherPlayerInfo from "../components/OtherPlayerInfo";
import RoomInfo from "../components/RoomInfo.vue";
import JudgerCard from "../components/JudgerCard.vue";
import FighterCard from "../components/FighterCard.vue";
import TableCard from "../components/TableCard.vue";
import PlayerBasicInfo from "../components/PlayerBasicInfo.vue";

export default {
    name: "GameTable",
    components: {
        OtherPlayerInfo,
        RoomInfo,
        JudgerCard,
        FighterCard,
        TableCard,
        PlayerBasicInfo
    },

    data() {
        return {
            // 前端展示设置
            IsShowSearchMatchDialog: false,
            IsShowAnimCanvas: false,
            WindoeWidth: 1920,
            WindowHeight: 1080,

            UserUid: new Date().getTime(),
            CurrChosenHandCardId: -1,

            GameConfig: null,
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

    updated() {
        this.OtherPlayerAreaDom = document.querySelector(".other_player_area");
    },

    mounted() {
        // this.sockets = io.connect("http://localhost:4001");
        this.$socket.open();

        // 连接到房间
        this.$socket.emit("COMMAND", {
            type: "CONNECT_TO_ROOM",
            UserUid: this.UserUid,
        });
        // 队列等待中
        this.sockets.subscribe("WAITE", () => {
            this.IsShowSearchMatchDialog = true;
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

    methods: {
        // 重连到房间恢复数据
        RestoreGameData(result) {
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
            this.GameData.FighterInfoList = FighterInfoList.sort(function (a, b) {
                return parseFloat(a.Id) - parseFloat(b.Id);
            });
            this.GameData.TableCardList = TableCardList;
            this.GameData.HandCards = HandCards;
            this.GameData.RemainCardsNum = RemainCardsNum;
            this.GameData.MyInfos = MyInfos;
            this.GameData.OtherPlayerList = OtherPlayerList;
        },

        // 初始化游戏数据
        SetInitGameData(result) {
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


        // tool functions 工具方法 ===========================
        // 鼠标挪入动画方法
        CustomBeforeMouseEnter(el) {
            el.style["transition"] = "all 0s";
            el.style.opacity = 0;
        },
        CustomMouseEnter(el, done) {
            Velocity(el, { scale: 1.3 }, { duration: 10 })
                .then((el) => {
                    return Velocity(el, { opacity: 1 }, { duration: 300 });
                })
                .then((el) => {
                    return Velocity(
                        el,
                        { scale: 1 },
                        {
                            duration: 200,
                            complete() {
                                done();
                            },
                        }
                    );
                });
        },
        CustomAfterMouseEnter(el) {
            el.style["transition"] = "all 0.2s";
            el.style.opacity = 1;
            el.style.transform = "";
        },

        // 获取每个角斗士身上的下注信息
        GetFighterBetDetails(id) {
            let res = [];
            this.GameData.FighterInfoList.map((f) => {
                if (f.Id == id) {
                    res = f.BetDetails;
                }
            });
            return res;
        }

    },

}

</script>

<style>
@import '../assets/styles/GameTable.css';
</style>