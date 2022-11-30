<template>
    <div class="operation_panel"
      v-if="PlayerIndex == CurrentPlayerIndex"
    >
        <div
            v-if="CurrentRoomStage == `BET`"
        >
            <el-button
                @click="this.OnEndBetFighters"
            >
                下注结束
            </el-button>
        </div>

        <div
            v-if="
                CurrentRoomStage == `CARD` 
                && CurrentPlayerIndex==PlayerIndex
                && PlayerStatus != `FOLDED`
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
                v-if="PlayerStatus == `PAID_USE_CARD`"
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
        BetDetails: Array, // bet infos
        PlayerStatus: String,
        CurrentRoomStage: String,
        RoomNumber: String,
        PlayerIndex: Number,
        CurrentPlayerIndex: Number,
        TempCredit: Number,
        CheckCardCost: Number,
    },
    data(){
        return {
        }
    },
    methods:{
        OnEndBetFighters(){
            if (this.BetDetails.length <= 0) {
                this.$message({
                    showClose: false,
                    message: '至少下注一名角斗士',
                    type: 'error'
                });
            } else {
                // change server data
                this.$socket.emit("COMMAND",{
                    type:"END_BET_FIGHTERS",
                    RoomNumber: this.RoomNumber,
                    PlayerIndex: this.PlayerIndex
                });
            }
        },
        OnClickCheckCard(){
            if (this.TempCredit < this.CheckCardCost)
            {
                this.$message({
                    showClose: false,
                    message: '剩余金钱小于过牌所需金额',
                    type: 'error'
                });
                return ;
            }
            else
            {
                this.$socket.emit("COMMAND",{
                    type:"CHECK_CARD",
                    RoomNumber: this.RoomNumber,
                    PlayerIndex: this.PlayerIndex
                });
            }
        },
        OnClickFoldCard(){
            this.$socket.emit("COMMAND",{
                type:"FOLD_CARD",
                RoomNumber: this.RoomNumber,
                PlayerIndex: this.PlayerIndex
            });
        },
        OnClickEndUseCard(){
            this.$socket.emit("COMMAND",{
                type:"END_USE_CARD",
                RoomNumber: this.RoomNumber,
                PlayerIndex: this.PlayerIndex
            });
        }
    },
    computed: {
        
    }
}
</script>

<style>
.operation_panel{
    width: 100%;
    margin: 20px;
}
</style>