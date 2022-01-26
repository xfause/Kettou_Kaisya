<template>
    <div class="operation_panel">
        <div
            v-if="roomStatus == `BET`"
        >
            <el-button
                @click="this.OnEndBetFighters"
            >
                下注结束
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