<template>
  <div class="fighter_card">
    <div v-if="this.Fighter !== null">
      <el-popover
        placement="left-start"
        width="200"
        trigger="hover"
      >
        <el-table :data="FighterBetDetails" stripe>
          <el-table-column prop="BetPlayerIndex" label="玩家Index" width="100">
          </el-table-column>
          <el-table-column prop="BetCredit" label="下注金额" width="80">
          </el-table-column>
        </el-table>
        <div slot="reference">
          <div>角斗士</div>
          <div>ID:{{ id }}</div>
          <div>名称:{{ name }}</div>
          <div>生命值:{{ health }}</div>
          <div>魔法值:{{ magic }}</div>
          <div>描述:{{ desc }}</div>
          <div
            :key="buff.name"
            v-for="buff in this.Fighter.ConstBuffList"
          >
            永久词缀:{{GetBuffDesc(buff)}}
          </div>
          <div
            :key="buff.name"
            v-for="buff in this.Fighter.TempBuffList"
          >
            临时词缀:{{GetBuffDesc(buff)}}
          </div>
          
          <div>赏金倍率:{{ creditFactor }}</div>
          <div
            v-if="
              this.status == `NOT_BETED` &&
              this.roomStatus == `BET` &&
              !IsBetedOnThisFighter
            "
          >
            <el-button
              v-if="!this.IsShowBetInput && PlayerIndex == CurrentPlayerIndex"
              @click="this.OnShowBetInput"
            >
              下注
            </el-button>
            <div v-if="this.IsShowBetInput">
              <el-input-number
                :value="0"
                :max="this.TempCredit"
                :min="0"
                :step="1"
                :step-strictly="true"
                :controls="false"
                @change="this.OnBetInputChange"
                class="bet_fighter_credit_input"
              />
              <el-button @click="this.OnSendBetData"> 确定 </el-button>
              <el-button @click="this.OnHideBetInput"> 取消 </el-button>
            </div>
          </div>
        </div>
      </el-popover>
    </div>
    <div v-if="this.Fighter == null">
      <div>角斗士</div>
      <div>空</div>
    </div>
  </div>
</template>

<script>
import { EventBus } from "../eventBus";

export default {
  name: "FighterCard",
  props: {
    Fighter: Object, // fighter infos
    PlayerStatus: String, // player status
    GameCurrStage: String, // room status
    PlayerTempCredit: Number,
    PlayerIndex: Number,
    CurrentPlayerIndex: Number,
    RoomNumber: String,
    BetDetails: Array,
    FighterBetDetails: Array,
    FighterStatusList: Array
  },
  data() {
    return {
      IsShowBetInput: false,
      MaxBetCredit: this.PlayerTempCredit,
      CurrentBetMoney: 0,
    };
  },
  created() {
    var that = this;
    EventBus.$on("IsOnBetOtherFighter", function (d) {
      if (d.id != that.id) {
        that.IsShowBetInput = false;
      }
    });
  },
  mounted() {
    // TODO
    // 修改命令标识符
    this.sockets.subscribe("ALREADY_BET_ONCE", () => {
      this.IsShowBetInput = false;
    });
  },
  methods: {
    GetBuffDesc(s){
      let t = this.FighterStatusList.find(x => x.name === s);
      if (t==undefined) {
        return s;
      } else {
        return t.desc;
      }
    },
    OnShowBetInput() {
      EventBus.$emit("IsOnBetOtherFighter", {
        id: this.id,
      });
      this.IsShowBetInput = true;
    },
    OnHideBetInput() {
      this.IsShowBetInput = false;
      this.CurrentBetMoney = 0;
    },
    OnSendBetData() {
      // TODO
      // 向服务器发送下注指令
      // this.$socket.emit("COMMAND", {
      //   type: "BET_ON_FIGHTERS",
      //   roomNumber: this.roomNumber,
      //   fighterId: this.id,
      //   betMoney: this.currentBetMoney,
      //   memberIndex: this.memberIndex,
      // });
      // this.CurrentBetMoney = 0;
    },
    OnBetInputChange(currentValue) {
      this.CurrentBetMoney = currentValue;
    },
  },
  computed: {
    id() {
      if (this.Fighter) {
        return this.Fighter.Id;
      } else {
        return "N/A";
      }
    },
    name() {
      if (this.Fighter) {
        return this.Fighter.Name;
      } else {
        return "N/A";
      }
    },
    desc() {
      if (this.Fighter) {
        return this.Fighter.Desc;
      } else {
        return "N/A";
      }
    },
    health() {
      if (this.Fighter) {
        return this.Fighter.Health;
      } else {
        return "N/A";
      }
    },
    magic() {
      if (this.Fighter) {
        return this.Fighter.Magic;
      } else {
        return "N/A";
      }
    },
    creditFactor() {
      if (this.Fighter) {
        return this.Fighter.CreditFactor;
      } else {
        return "N/A";
      }
    },
    IsBetedOnThisFighter() {
      let res = false;
      if (this.BetDetails) {
        this.BetDetails.map((b) => {
          if (b.FighterId == this.id) {
            res = true;
          }
        });
      }
      return res;
    },
  },
};
</script>

<style>
  @import '../assets/styles/FighterCard.css';
</style>