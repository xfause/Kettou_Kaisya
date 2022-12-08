<template>
    <div>
        <div>回合:{{CurrentRound}}/{{RoundLimit}}</div>
        <div>公共奖池:{{PublicJackpot}}</div>
        <div>当前阶段:{{Str_stage}}阶段</div>
    </div>
</template>

<script>
export default {
    name: "RoomInfo",
    props: {
        CurrentRound: Number, // current round
        RoundLimit: Number, // total rounds
        PublicJackpot: Number, // jackpot money
        CurrentStage: String, // jackpot money
    },
    data(){
        return {}
    },
    computed: {
        Str_stage(){
            if (this.CurrentStage == "PREPARE") {
                return "准备"
            } else if (this.CurrentStage == "BET") {
                return "下注"
            } else if (this.CurrentStage == "CARD") {
                return "出牌"
            } else if (this.CurrentStage == "JUDGE") {
                return "判定"
            } else if (this.CurrentStage == "CALC") {
                return "结算"
            }
            return "N/A";
        }
    }
}
</script>

<style>

</style>>
