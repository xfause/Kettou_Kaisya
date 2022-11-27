<template>
    <div class="other_player_info">
        <div>玩家序号:{{PlayerIndex}}</div>
        <div>临时资金:{{TempCredit}}</div>
        <div>胜点:{{WinCredit}}</div>
        <div>手牌数:{{HandCardsNum}}</div>
        <div>状态:{{Str_status}}</div>
    </div>
</template>

<script>
export default {
    name: "OtherPlayerInfo",
    props: {
        TempCredit: Number, // 临时资金
        WinCredit: Number, // 胜点
        PlayerIndex: Number, // 用户序号
        HandCardsNum: Number, // 手牌数
        Status: String, // 状态
    },
    data(){
        return {}
    },
    computed: {
        Str_status(){
            if (this.Status == "BETED") {
                return "已下注"
            } else if (this.Status == "NOT_BETED") {
                return "未下注"
            } else if (this.Status == "FOLDED") {
                return "已弃牌"
            } else if (this.Status == "NOT_FOLDED") {
                return "未弃牌"
            } else if (this.Status == "PAID_USE_CARD") {
                return "已出牌"
            } else if (this.Status == "OFFLINE") {
                return "掉线"
            }
            return "";
        }
    }
}
</script>

<style>
.other_player_info{
    background-color: white;
}
</style>>
