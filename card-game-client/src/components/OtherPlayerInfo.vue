<template>
    <div class="other_player_info">
        <div>memberIndex:{{memberIndex}}</div>
        <div>money:{{money}}</div>
        <div>手牌数:{{handCardsNum}}</div>
        <div>Status:{{str_status}}</div>
    </div>
</template>

<script>
export default {
    name: "OtherPlayerInfo",
    props: {
        money: Number, // 剩余金钱数
        memberIndex: Number, // 用户序号
        handCardsNum: Number, // 手牌数
        status: String, // 状态
    },
    data(){
        return {}
    },
    computed: {
        str_status(){
            if (this.status == "BETED") {
                return "已下注"
            } else if (this.status == "NOT_BETED") {
                return "未下注"
            } else if (this.status == "FOLDED") {
                return "已弃牌"
            } else if (this.status == "NOT_FOLDED") {
                return "未弃牌"
            } else if (this.status == "PAID_USE_CARD") {
                return "已出牌"
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
