<template>
    <div class="app">
        <div class="table">
            <div class="top_area">
                <transition-group 
                    class="other_player_area"
                    tag="div"
                    :css="false"
                    @enter="enter"
                    @before-enter="beforeEnter"
                    @after-enter="afterEnter"
                >
                    <OtherPlayerInfo
                        :key="p.memberIndex"
                        :index="index"
                        :money="p.money"
                        :memberIndex="p.memberIndex"
                        :handCardsNum="p.handCardsNum"
                        :status="p.status"
                        v-for="(p, index) in gameData.otherPlayerList"
                    />
                </transition-group >

                <div class="room_info_area">
                    <RoomInfo
                        :currentRound="gameData.currentRound"
                        :roundNumLimit="gameData.roundNumLimit"
                        :jackpot="gameData.jackpot"
                        :status="gameData.status"
                    />
                </div>
            </div>

            <div class="table_area">
                <div class ="fate_judger_area">
                    <JudgerCard
                        :judgerCard="gameData.judgerCard"
                    />

                    <FateCard 
                        :fateCard="gameData.fateCard"
                    />
                </div>

                <transition-group 
                    class="fighters_area"
                    tag="div"
                    :css="false"
                    @enter="enter"
                    @before-enter="beforeEnter"
                    @after-enter="afterEnter"
                >
                    <FighterCard
                        :key="f.id"
                        :index="f.id"
                        :status="gameData.myInfos.status"
                        :money="gameData.myInfos.money"
                        :betInfos="gameData.betInfos"
                        :fighter="f"
                        v-for="(f) in gameData.fightersInfo"
                    />
                </transition-group >

                <div class ="table_cards_area">
                    table card list
                </div>
            </div>

            <div class="my_area">
                <div class="my_basic_info">
                    <MyBasicInfo 
                        v-if="gameData.myInfos"
                        :memberIndex="gameData.myInfos.memberIndex"
                        :status="gameData.myInfos.status"
                        :money="gameData.myInfos.money"
                    />
                </div>

                <transition-group
                    class="my_hand_cards"
                    tag="div"
                    :css="false"
                    @enter="enter"
                    @before-enter="beforeEnter"
                    @after-enter="afterEnter"
                >
                    <!-- <Card 
                        :key="c.k"
                        :index="index"
                        :data="c"
                        :isOut="true"
                        :todo = "todo"
                        @onAttackStart="onAttackStart"
                        :chooseCard="chooseTableCard"
                        v-for="(c, index) in gameData.handCards"
                    /> -->
                    hand cards
                </transition-group>

                <div class="my_remain_cards_info">
                    <RemainCards
                        :remainCardsNum="gameData.remainCardsNum"
                    />
                </div>
            </div>
            
            <div class="match-dialog-container" 
                v-show="matchDialogShow">
                正在匹配，请等待
            </div>

            <canvas 
                id="animationCanvas" 
                v-show="showCanvas" 
                :width="windowWidth" 
                :height="windowHeight">
            </canvas>

        </div>
    </div>
</template>

<script>
import * as io from "socket.io-client";
import RoomInfo from "../components/RoomInfo";
import MyBasicInfo from "../components/MyBasicInfo";
import OtherPlayerInfo from "../components/OtherPlayerInfo";
import RemainCards from "../components/RemainCards";
import JudgerCard from "../components/JudgerCard";
import FateCard from "../components/FateCard";
import FighterCard from "../components/FighterCard";
// import Card from "../components/Card"
// import OtherPlayerInfoBlock from "../components/OtherPlayerInfoBlock"
import Velocity from 'velocity-animate';

export default {
    name: "GameTable",
    components: { 
        RoomInfo, MyBasicInfo, OtherPlayerInfo,
        RemainCards, 
        JudgerCard, FateCard, FighterCard
    },

    // table page data structs
    data(){
        return {
            matchDialogShow: false,
            // todo
            count: 0,
            userId: new Date().getTime(),
            showCanvas: false,

            windowWidth: 1920,
            windowHeight: 1080,

            // for drag and use card index
            currentCardIndex: -1,

            // show rank list
            showRankList: false,

            gameData: {
                memberIndex: -1,
                roomNumber: -1,

                rankList: [],

                jackpot: 0,
                status: "",
                currentRound: 0,
                roundNumLimit: 0,
                currentPlayerIndex: -1,
                judgerCard: null,
                fateCard: null,

                winnerFighterIndex: -1,
                // 玩家下注给几号fighter 下注了多少钱
                betInfos: [],
                fightersInfo: [],

                tableCards: [],
                preUseCardFee: -1,
                preUseCardPlayerIndex: -1,
                handCards: [],
                remainCardsNum: -1,
                otherPlayerList: [],
                myInfos: null,
            }
        }
    },

    mounted(){
        this.socket = io.connect("http://localhost:4001");

        // connect to room
        this.socket.emit("COMMAND", {
            type: "CONNECT",
            userId: this.userId
        });

        // wait in queue
        this.socket.on("WAITE", () => {
            this.matchDialogShow = true;
        });

        // reconnect to game
        this.socket.on("RECONNECT", (result) => {
            this.gameData.roomNumber = result.roomNumber;
            this.gameData.memberIndex = result.memberIndex;
        });
        this.socket.on("RESTORE_DATA",(result)=>{
            this.RestoreGameData(result);
        });

        // game start initial data
        this.socket.on("INIT_DATA", (result)=>{
            this.SetInitGameData(result);
        });

        // player bet on fighters change
        this.socket.on("AFTER_BET_DATA",(result)=>{
            this.OnPlayerBetFighters(result);
        })

        // change room stage
        this.socket.on("CHANGE_ROOM_STAGE", (result)=>{
            this.OnChangeRoomStage(result);
        });

        // my check card
        this.socket.on("MY_CHECK_CARD", (result)=>{
            this.OnMyCheckCard(result);
        })

        // other check card
        this.socket.on("OTHER_CHECK_CARD", (result)=>{
            this.OnOtherCheckCard(result)
        })

        // player fold card
        this.socket.on("FOLD_CARD",(result)=>{
            this.OnPlayerFoldCard(result);
        })

        // my use card
        this.socket.on("MY_USE_CARD",(result)=>{
            this.OnMyUseCard(result);
        })

        // other use card
        this.socket.on("OTHER_USE_CARD",(result)=>{
            this.OnOtherUseCard(result);
        })

        // player end use card
        this.socket.on("END_USE_CARD",(result)=>{
            this.OnEndUseCard(result);
        })

        // judge stage -> active card
        this.socket.on("JUDGE_ACTIVE_CARD",(result)=>{
            this.OnJudgeStageActiveCard(result);
        })

        // get winner fighter index
        this.socket.on("WINNER_FIGHTER", (result)=>{
            this.GetWinnerFighter(result);
        })

        // after all rounds game end
        this.socket.on("GAME_END", (result)=>{
            this.OnGameEnd(result);
        })
    },

    methods:{
        beforeEnter(el) {
            el.style['transition'] = "all 0s";
            el.style.opacity = 0
        },
        enter(el, done) {
            Velocity(el, {scale: 1.3}, {duration: 10})
                .then(el => {
                    return Velocity(el, {opacity: 1}, {duration: 300})
                })
                .then(el => {
                    return Velocity(el, {scale: 1}, {duration: 200, complete() {done()}})
                })
        },
        afterEnter(el) {
            el.style['transition'] = "all 0.2s";
            el.style.opacity = 1;
            el.style.transform = '';
        },

        RestoreGameData(result){
            const {
                jackpot, status, currentRound, roundNumLimit,
                currentPlayerIndex,
                judgerCard, fateCard, fightersInfo,
                tableCards,
                preUseCardFee, preUseCardPlayerIndex,
                handCards, remainCardsNum,
                myInfos,
                otherPlayerList
            } = result
            this.gameData.jackpot = jackpot;
            this.gameData.status = status;
            this.gameData.currentRound = currentRound;
            this.gameData.roundNumLimit = roundNumLimit;
            this.gameData.currentPlayerIndex = currentPlayerIndex;
            this.gameData.judgerCard = judgerCard;
            this.gameData.fateCard = fateCard;
            this.gameData.fightersInfo = fightersInfo.sort(function(a, b) {
                return parseFloat(a.id) - parseFloat(b.id);
            });
            this.gameData.tableCards = tableCards;
            this.gameData.preUseCardFee = preUseCardFee;
            this.gameData.preUseCardPlayerIndex = preUseCardPlayerIndex;
            this.gameData.handCards = handCards;
            this.gameData.remainCardsNum = remainCardsNum;
            this.gameData.myInfos = myInfos;
            this.gameData.otherPlayerList = otherPlayerList;
        },

        SetInitGameData(result){
            const {
                jackpot, status, currentRound, roundNumLimit,
                currentPlayerIndex,
                judgerCard, fateCard, fightersInfo,
                tableCards,
                preUseCardFee, preUseCardPlayerIndex,
                handCards, remainCardsNum,
                myInfos,
                otherPlayerList
            } = result
            this.gameData.jackpot = jackpot;
            this.gameData.status = status;
            this.gameData.currentRound = currentRound;
            this.gameData.roundNumLimit = roundNumLimit;
            this.gameData.currentPlayerIndex = currentPlayerIndex;
            this.gameData.judgerCard = judgerCard;
            this.gameData.fateCard = fateCard;
            this.gameData.fightersInfo = fightersInfo.sort(function(a, b) {
                return parseFloat(a.id) - parseFloat(b.id);
            });
            this.gameData.tableCards = tableCards;
            this.gameData.preUseCardFee = preUseCardFee;
            this.gameData.preUseCardPlayerIndex = preUseCardPlayerIndex;
            this.gameData.handCards = handCards;
            this.gameData.remainCardsNum = remainCardsNum;
            this.gameData.myInfos = myInfos;
            this.gameData.otherPlayerList = otherPlayerList;
        },

        OnPlayerBetFighters(result){
            // playerBetStatus:{
            //     status, memberIndex
            //     userId, money,
            //     betInfos
            //     currentPlayerIndex
            // }
            const {fightersInfo, playerBetStatus} = result;
            this.gameData.fightersInfo = fightersInfo.sort(function(a, b) {
                return parseFloat(a.id) - parseFloat(b.id);
            });

            playerBetStatus.map(p=>{
                if (p.memberIndex == this.gameData.memberIndex) {
                    // my bet
                    this.gameData.myInfos.status = p.status;
                    this.gameData.myInfos.money = p.money;
                    this.gameData.currentPlayerIndex = p.currentPlayerIndex;
                    this.gameData.betInfos = p.betInfos;
                } else {
                    // other player bet
                    const pIndex = this.gameData.otherPlayerList.findIndex(obj=>obj.memberIndex == p.memberIndex);
                    this.gameData.otherPlayerList[pIndex].money = p.money
                    this.gameData.otherPlayerList[pIndex].status = p.status
                    this.gameData.currentPlayerIndex = p.currentPlayerIndex;
                }
            })
        },

        OnChangeRoomStage(result){
            const {status} = result;
            this.gameData.status = status;
            if (status == "CARD") {
                const {fateCard} = result;
                this.gameData.fateCard = fateCard;
            } 
            // else if (status == "JUDGE") {
            // } else if (status == "CALC") {
            // }
        },

        OnMyCheckCard(result){
            // handCards,remainCardsNum,
            // money, jackpot, currentPlayerIndex
            const {handCards, remainCardsNum, 
                money, jackpot, currentPlayerIndex
            } = result;
            this.gameData.handCards = handCards;
            this.gameData.remainCardsNum = remainCardsNum;
            this.gameData.myInfos.money = money;
            this.gameData.jackpot = jackpot;
            this.gameData.currentPlayerIndex = currentPlayerIndex;
        },

        OnOtherCheckCard(result){
            // jackpot,
            // prePlayerIndex,
            // money,
            // handCardsNum
            // currentPlayerIndex
            const {jackpot, prePlayerIndex, money,
                handCardsNum, currentPlayerIndex
            } = result;
            this.gameData.jackpot = jackpot;
            this.gameData.currentPlayerIndex = currentPlayerIndex;
            let changedPlayerIndex = this.gameData.otherPlayerList.findIndex(obj=>obj.memberIndex == prePlayerIndex);
            this.gameData.otherPlayerList[changedPlayerIndex].money = money;
            this.gameData.otherPlayerList[changedPlayerIndex].handCardsNum = handCardsNum;
        },

        OnPlayerFoldCard(result){
            // preFoldPlayerIndex,currentPlayerIndex
            const {preFoldPlayerIndex, currentPlayerIndex} = result;
            let pIndex = this.gameData.otherPlayerList.findIndex(obj=>obj.memberIndex == preFoldPlayerIndex);
            this.gameData.otherPlayerList[pIndex].status = "FOLDED";
            this.gameData.currentPlayerIndex = currentPlayerIndex;
        },

        OnMyUseCard(result){
            // tableCards, handCards, jackpot, status
            const {tableCards, handCards, jackpot, status} = result;
            this.gameData.tableCards = tableCards;
            if (!this.gameData.myInfos) {
                this.gameData.myInfos = {status};
            } else {
                this.gameData.myInfos.status = status;
            }
            this.gameData.handCards = handCards;
            this.gameData.jackpot = jackpot;
        },

        OnOtherUseCard(result){
            // useCardPlayerIndex,useCardPlayerHandCardsNumber,
            // jackpot,preUseCardFee,tableCards
            const {
                useCardPlayerIndex,useCardPlayerHandCardsNumber,useCardPlayerStatus,
                jackpot,preUseCardFee,tableCards
            } = result;
                this.gameData.jackpot = jackpot;
                this.gameData.preUseCardFee = preUseCardFee;
                this.gameData.tableCards = tableCards;
                let pIndex = this.gameData.otherPlayerList.findIndex(obj=>obj.memberIndex == useCardPlayerIndex);
                this.gameData.otherPlayerList[pIndex].status = useCardPlayerStatus;
                this.gameData.otherPlayerList[pIndex].handCardsNum = useCardPlayerHandCardsNumber;
        },

        OnEndUseCard(result){
            // status currentPlayerIndex
            const {status, currentPlayerIndex} =result;
            if (currentPlayerIndex == this.gameData.memberIndex) {
                this.gameData.myInfos.status = status;
            } else {
                let pIndex = this.gameData.otherPlayerList.findIndex(obj=>obj.memberIndex == currentPlayerIndex);
                this.gameData.otherPlayerList[pIndex].status = status;
            }
        },

        OnJudgeStageActiveCard(result){
            const {
                jackpot, status,
                currentRound,
                judgerCard, fateCard, fightersInfo,
                tableCards,
                // preUseCardFee, preUseCardPlayerIndex, currentPlayerIndex,
                handCards, remainCardsNum,
                otherPlayerList
            } = result;
            this.gameData.jackpot = jackpot;
            this.gameData.status = status;
            this.gameData.currentRound = currentRound;
            this.gameData.judgerCard = judgerCard;
            this.gameData.fateCard = fateCard;
            this.gameData.fightersInfo = fightersInfo.sort(function(a, b) {
                return parseFloat(a.id) - parseFloat(b.id);
            });
            this.gameData.tableCards = tableCards;
            this.gameData.handCards = handCards;
            this.gameData.remainCardsNum = remainCardsNum;
            this.gameData.otherPlayerList = otherPlayerList;
        },

        GetWinnerFighter(result){
            // winnerFighterIndex
            this.gameData.winnerFighterIndex = result.winnerFighterIndex;
        },

        OnGameEnd(result){
            // rankList
            this.showRankList = true;
            this.gameData.rankList = result.rankList;
        }
    }
}
</script>

<style scoped>

    .app {
        width: 100%;
        height: 100%;
        overflow: hidden;
        user-select: none;
    }

    .table {
        width: 100%;
        height: 100%;
    }

    .top_area{
        width: 100%;
        height: 20%;
    }

    .room_info_area{
        width: 40%;
        height: 100%;
        background-color: rgb(251, 84, 84);
        float: right;
    }

    .other_player_area{
        width: 60%;
        height: 100%;
        display: flex;
        padding: 10px;
        justify-content: center;
        box-sizing: border-box;
        flex-wrap: wrap;
        background-color: #00f;
        float: left;
        column-gap: 10px;
    }

    .my_area{
        width: 100%;
        height: 25%;
        min-height: 170px;
        position: absolute;
        bottom: 0px;
        /* display: flex; */
        padding: 10px;
        box-sizing: border-box;
        /* justify-content: center; */
        background-color: #0f0;
    }

    .my_basic_info{
        background-color: grey;
        width: 200px;
        height: 100%;
        position: absolute;
        left: 0px;
        top:0px;
    }

    .my_remain_cards_info{
        background-color: grey;
        width: 200px;
        height: 100%;
        position: absolute;
        right: 0px;
        top:0px;
    }

    .my_hand_cards {
        height: 100%;
        margin-left: 200px;
        margin-right: 200px;
        background-color: white;
    }

    .table_area{
        background-color: rgb(31, 255, 255);
        height: 55%;
        width: 100%;
    }

    .fate_judger_area{
        background-color: rgb(109, 58, 250);
        width: 12.5%;
        height: 100%;
        float: left;
    }

    .fighters_area{
        background-color: rgb(250, 58, 250);
        height: 100%;
        margin-left: 12.5%;
        margin-right: 55%;
        display: flex;
        padding: 10px;
        justify-content: center;
        box-sizing: border-box;
        flex-wrap: wrap;
        column-gap: 10px;
        row-gap: 10px;
    }

    .table_cards_area{
        background-color: rgb(215, 250, 58);
        width: 55%;
        position: absolute;
        right: 0px;
        top: 20%;
        height: 55%;
    }
</style>