<template>
    <div>
        <div>memberIndex:{{memberIndex}}</div>
        <div>money:{{money}}</div>
        <div>Status:{{str_status}}</div>
    </div>
</template>

<script>
export default {
    name: "MyBasicInfo",
    props: {
        money: Number, // 剩余金钱数
        memberIndex: Number, // 用户序号
        status: String, // 用户状态
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

</style>>
