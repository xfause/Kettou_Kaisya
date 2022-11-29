<template>
    <div class="operation_panel"
      v-if="memberIndex == currentPlayerIndex"
    >
        <div
            v-if="roomStatus == `BET`"
        >
            <el-button
                @click="this.OnEndBetFighters"
            >
                下注结束
            </el-button>
        </div>

        <div
            v-if="
                roomStatus == `CARD` 
                && currentPlayerIndex==memberIndex
                && playerStatus != `FOLDED`
                "
        >
            <el-button
                @click="this.OnClickCheckCard"
            >
                过牌
            </el-button>
            <el-button
                @click="this.OnClickFoldCard"
            >
                弃牌
            </el-button>
            <el-button
                v-if="playerStatus == `PAID_USE_CARD`"
                @click="this.OnClickEndUseCard"
            >
                结束出牌
            </el-button>
        </div>
    </div>
</template>

<script>
export default {
    name: "OperationPanel",
    props: {
        betInfos: Array, // bet infos
        playerStatus: String,
        roomStatus: String,
        roomNumber: String,
        memberIndex: Number,
        currentPlayerIndex: Number,
        checkCardFee: Number,
        money: Number,
    },
    data(){
        return {
        }
    },
    methods:{
        OnEndBetFighters(){
            if (this.betInfos.length <= 0) {
                this.$message({
                    showClose: false,
                    message: '至少下注一名角斗士',
                    type: 'error'
                });
            } else {
                // change server data
                this.$socket.emit("COMMAND",{
                    type:"END_BET_FIGHTERS",
                    roomNumber: this.roomNumber,
                    memberIndex: this.memberIndex
                });
            }
        },
        OnClickCheckCard(){
            if (this.money < this.checkCardFee) {
                this.$message({
                    showClose: false,
                    message: '剩余金钱小于过牌所需金额',
                    type: 'error'
                });
                return ;
            }  else {
                this.$socket.emit("COMMAND",{
                    type:"CHECK_CARD",
                    roomNumber: this.roomNumber,
                    memberIndex: this.memberIndex
                });
            }
        },
        OnClickFoldCard(){
            this.$socket.emit("COMMAND",{
                type:"FOLD_CARD",
                roomNumber: this.roomNumber,
                memberIndex: this.memberIndex
            });
        },
        OnClickEndUseCard(){
            this.$socket.emit("COMMAND",{
                type:"END_USE_CARD",
                roomNumber: this.roomNumber,
                memberIndex: this.memberIndex
            });
        }
    },
    computed: {
        desc() {
            if (this.judgerCard) {
                return this.judgerCard.desc;
            } else {
                return "N/A"
            }
        },
    }
}
</script>

<style>
.operation_panel{
    width: 100%;
    margin: 20px;
}
</style>