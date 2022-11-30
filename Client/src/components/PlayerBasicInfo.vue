<template>
    <div>
        <div>用户序号:{{PlayerIndex}}</div>
        <div>临时资金:{{TempCredit}}</div>
        <div>胜点:{{WinCredit}}</div>
        <div>状态:{{str_status}}</div>

        <OperationPanel
            :PlayerStatus="this.Status"
            :CurrentRoomStage="this.CurrentStage"
            :BetDetails="this.BetDetails"
            :PlayerIndex="this.PlayerIndex"
            :CurrentPlayerIndex="this.CurrentPlayerIndex"
            :RoomNumber="this.RoomNumber"
            :TempCredit="this.TempCredit"
            :CheckCardCost="this.CheckCardCost"
        />
    </div>
</template>

<script>
import OperationPanel from "../components/OperationPanel";

export default {
    name: "PlayerBasicInfo",
    components: { 
        OperationPanel
    },
    props: {
        TempCredit: Number, // 临时资金
        WinCredit: Number, // 胜点
        PlayerIndex: Number, // 用户序号
        Status: String, // 用户状态

        // for operation panel
        CurrentStage: String, // 房间状态
        BetDetails: Array,
        RoomNumber: String,
        CurrentPlayerIndex: Number,
        CheckCardCost: Number,
    },
    data(){
        return {}
    },
    computed: {
        Str_status(){
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
            return "N/A";
        }
    }
}
</script>

<style>

</style>
