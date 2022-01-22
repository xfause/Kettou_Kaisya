<template>
    <div class="app">
        <div class="table">
            <transition-group 
                class="other_player_area"
                tag="div"
                :css="false"
                @enter="enter"
                @before-enter="beforeEnter"
                @after-enter="afterEnter"
            >
                <!-- <OtherPlayerInfoBlock 
                    :key="p.memberIndex"
                    :index="index"
                    :data="p"
                    v-for="(p, index) in gameData.otherPlayerList"
                /> -->
                other player info cards
            </transition-group >

            <div class="table_area">
                <div class ="fate_judger_area">
                    fate card and judger card
                </div>

                <div class ="fighters_area">
                    fighters list
                </div>

                <div class ="table_cards_area">
                    table card list
                </div>
            </div>

            <div class="my_area">
                <div class="my_basic_info">
                    my basic info: money/personal
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
                    remain cards number
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
// import Card from "../components/Card"
// import OtherPlayerInfoBlock from "../components/OtherPlayerInfoBlock"
import Velocity from 'velocity-animate';

export default {
    name: "GameTable",
    // components: {Card},

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

            gameData: {
                memberIndex: -1,
                roomNumber: -1,

                jackpot: 0,
                status: "",
                currentRound: 0,
                currentPlayerIndex: -1,
                judgerCard: null,
                fateCard: null,
                fightersInfo: [],
                tableCards: [],
                preUseCardFee: 0,
                preUseCardPlayerIndex: -1,
                handCards: [],
                remainCardsNum: -1,
                otherPlayerList: []
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
            // todo
            // jackpot, status, currentRound, currentPlayerIndex,
            // judgerCard, fateCard, fightersInfo,
            // tableCards,
            // preUseCardFee, preUseCardPlayerIndex,
            // handCards,remainCardsNum,
            // otherPlayerList,
        },

        SetInitGameData(result){
            // todo
            // jackpot, status, currentRound, currentPlayerIndex,
            // judgerCard, fightersInfo,
            // tableCards,
            // preUseCardFee, preUseCardPlayerIndex,
            // handCards, remainCardsNum,
            // otherPlayerList
        },

        OnPlayerBetFighters(result){
            // todo
            // fightersInfo: memoryData[roomNumber]["fightersInfo"],
            // playerBetStatus: memoryData[roomNumber][usersList].map(o => {
            //     return {
            //         status: o.status,
            //         memberIndex: o.memberIndex,
            //         userId: o.userId,
            //         money: o.money,
            //         currentPlayerIndex: memoryData[roomNumber].currentPlayerIndex
            //     }
            // })
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
            // todo
        },

        OnOtherCheckCard(result){
            // todo
            // jackpot: memoryData[roomNumber].jackpot,
            // prePlayerIndex: currUserIndex,
            // money: memoryData[roomNumber][usersList][currUserIndex].money,
            // handCardsNum: memoryData[roomNumber][usersList][currUserIndex].handCards.length,
            // currentPlayerIndex: memoryData[roomNumber].currentPlayerIndex
        },

        OnPlayerFoldCard(result){
            // todo
            // preFoldPlayerIndex,currentPlayerIndex
        },

        OnMyUseCard(result){
            // todo
            // tableCards, handCards, jackpot, status
        },

        OnOtherUseCard(result){
            // todo
            // useCardPlayerIndex,useCardPlayerHandCardsNumber,
            // jackpot,preUseCardFee,tableCards
        },

        OnEndUseCard(result){
            // todo
            // status currentPlayerIndex
        },

        OnJudgeStageActiveCard(result){
            // todo
            // jackpot, status,
            // currentRound, currentPlayerIndex,
            // judgerCard, fateCard, fightersInfo,
            // tableCards,
            // preUseCardFee, preUseCardPlayerIndex,
            // handCards, remainCardsNum,
            // otherPlayerList
        },

        GetWinnerFighter(result){
            // todo
            // winnerFighterIndex
        },

        OnGameEnd(result){
            // todo
            // rankList
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

    .other_player_area{
        width: 60%;
        height: 20%;
        min-height: 170px;
        display: flex;
        padding: 10px;
        justify-content: center;
        box-sizing: border-box;
        flex-wrap: wrap;
        background-color: #00f;
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
        margin-right: 35%;
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