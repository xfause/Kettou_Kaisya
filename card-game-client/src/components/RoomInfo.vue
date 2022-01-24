<template>
    <div>
        <div>Round:{{currentRound}}/{{roundNumLimit}}</div>
        <div>Jackpot:{{jackpot}}</div>
        <div>Stage:{{stage}}</div>
    </div>
</template>

<script>
export default {
    name: "RoomInfo",
    props: {
        currentRound: Number, // current round
        roundNumLimit: Number, // total rounds
        jackpot: Number, // jackpot money
        status: String, // jackpot money
    },
    data(){
        return {}
    },
    computed: {
        stage(){
            if (this.status == "PREPARE") {
                return "准备"
            } else if (this.status == "BET") {
                return "下注"
            } else if (this.status == "CARD") {
                return "出牌"
            } else if (this.status == "JUDGE") {
                return "判定"
            } else if (this.status == "CALC") {
                return "结算"
            }
            return "";
        }
    }
}
</script>

<style>

</style>>
