<template>
    <div>
        <div>memberIndex:{{memberIndex}}</div>
        <div>money:{{money}}</div>
        <div>Status:{{str_status}}</div>

        <OperationPanel
            :playerStatus="this.status"
            :roomStatus="this.roomStatus"
            :betInfos="this.betInfos"
            :memberIndex="this.memberIndex"
            :roomNumber="this.roomNumber"
        />
    </div>
</template>

<script>
import OperationPanel from "../components/OperationPanel";

export default {
    name: "MyBasicInfo",
    components: { 
        OperationPanel
    },
    props: {
        money: Number, // 剩余金钱数
        memberIndex: Number, // 用户序号
        status: String, // 用户状态

        // for operation panel
        roomStatus: String, // 房间状态
        betInfos: Array,
        roomNumber: String,
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
