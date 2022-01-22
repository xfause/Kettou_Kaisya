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
            
        </div>
    </div>
</template>

<script>
// import * as io from "socket.io-client";
// import Card from "../components/Card"
// import OtherPlayerInfoBlock from "../components/OtherPlayerInfoBlock"
import Velocity from 'velocity-animate';

export default {
    name: "GameTable",
    // components: {Card},
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