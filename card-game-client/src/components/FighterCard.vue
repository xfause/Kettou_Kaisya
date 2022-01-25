<template>
    <div class="fighter_card">
        <div 
            v-if="this.fighter!==null"
        >
            <div>角斗士</div>
            <div>id:{{id}}</div>
            <div>name:{{name}}</div>
            <div>health:{{health}}</div>
            <div>magic:{{magic}}</div>
            <div>描述:{{desc}}</div>
            <div>赏金倍率:{{magnification}}</div>
            <button 
                v-if="!this.showMoneyInput"
                @click="this.OnShowMoneyInput"
            >
                下注
            </button>
            <div v-if="this.showMoneyInput">
                输入框
            </div>
        </div>
        <div v-if="this.fighter==null">
            <div>角斗士</div>
            <div>空</div>
        </div>
    </div>
</template>

<script>
import { EventBus } from '../eventBus';
export default {
    name: "FighterCard",
    props: {
        fighter: Object, // fighter infos
        status: String,
        money: Number,
        betInfos: Array
    },
    data(){
        return {
            showMoneyInput: false
        }
    },
    created() {
        var that = this;
        EventBus.$on("otherShowMoneyInput",function (d) {
            if (d.id != that.id) {
                that.showMoneyInput = false;
            }
        });
    },
    methods:{
        OnShowMoneyInput(){
            EventBus.$emit("otherShowMoneyInput", {
                id: this.id
            });
            this.showMoneyInput = true;
        },
        OnSendBeyMoney(){
            // todo
        }
    },
    computed: {
        // id: 1,
        // name: "fighter1",
        // health: 1,
        // magic: 1,
        // healthBase: 1,
        // magicBase: 1,
        // desc: "test content 1",
        // // 倍率
        // magnification: 1.0,
        id() {
            if (this.fighter) {
                return this.fighter.id;
            } else {
                return "N/A"
            }
        },
        name() {
            if (this.fighter) {
                return this.fighter.name;
            } else {
                return "N/A"
            }
        },
        desc() {
            if (this.fighter) {
                return this.fighter.desc;
            } else {
                return "N/A"
            }
        },
        health(){
            if (this.fighter) {
                return this.fighter.health;
            } else {
                return "N/A"
            }
        },
        magic(){
            if (this.fighter) {
                return this.fighter.magic;
            } else {
                return "N/A"
            }
        },
        magnification(){
            if (this.fighter) {
                return this.fighter.magnification;
            } else {
                return "N/A"
            }
        },
    }
}
</script>

<style>
.fighter_card{
    width: 25%;
    background-color: white;
}
</style>