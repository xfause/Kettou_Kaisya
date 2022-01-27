<template>
  <div class="fighter_card">
    <div v-if="this.fighter !== null">
      <el-popover
        placement="left-start"
        width="200"
        trigger="hover"
      >
        <el-table :data="fighterBetInfos" stripe>
          <el-table-column prop="memberIndex" label="玩家Index" width="100">
          </el-table-column>
          <el-table-column prop="money" label="下注金额" width="80">
          </el-table-column>
        </el-table>
        <div slot="reference">
          <div>角斗士</div>
          <div>id:{{ id }}</div>
          <div>name:{{ name }}</div>
          <div>health:{{ health }}</div>
          <div>magic:{{ magic }}</div>
          <div>描述:{{ desc }}</div>
          <div>赏金倍率:{{ magnification }}</div>
          <div
            v-if="
              this.status == `NOT_BETED` &&
              this.roomStatus == `BET` &&
              !betedOnThisFighter
            "
          >
            <el-button
              v-if="!this.showMoneyInput"
              @click="this.OnShowMoneyInput"
            >
              下注
            </el-button>
            <div v-if="this.showMoneyInput">
              <!-- <el-input 
                  type='number' 
                  :max='this.money'
                  :min='0'
                  
              /> -->
              <el-input-number
                :value="0"
                :max="this.money"
                :min="0"
                :step="1"
                :step-strictly="true"
                :controls="false"
                @change="this.OnNumberInputChange"
                class="bet_fighter_money_input"
              />
              <el-button @click="this.OnSendBetData"> 确定 </el-button>
              <el-button @click="this.OnHideMoneyInput"> 取消 </el-button>
            </div>
          </div>
        </div>
      </el-popover>
    </div>
    <div v-if="this.fighter == null">
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
    fighter: Object, // fighter infos
    status: String, // player status
    roomStatus: String, // room status
    money: Number,
    memberIndex: Number,
    roomNumber: String,
    betInfos: Array,
    fighterBetInfos: Array
  },
  data() {
    return {
      showMoneyInput: false,
      maxBetMoney: this.money,
      currentBetMoney: 0,
    };
  },
  created() {
    var that = this;
    EventBus.$on("otherShowMoneyInput", function (d) {
      if (d.id != that.id) {
        that.showMoneyInput = false;
      }
    });
  },
  mounted() {
    this.sockets.subscribe("ALREADY_BET_ONCE", () => {
      this.showMoneyInput = false;
    });
  },
  methods: {
    OnShowMoneyInput() {
      EventBus.$emit("otherShowMoneyInput", {
        id: this.id,
      });
      this.showMoneyInput = true;
    },
    OnHideMoneyInput() {
      this.showMoneyInput = false;
      this.currentBetMoney = 0;
    },
    OnSendBetData() {
      // console.log(this.id);
      // console.log(this.currentBetMoney);
      this.$socket.emit("COMMAND", {
        type: "BET_ON_FIGHTERS",
        roomNumber: this.roomNumber,
        fighterId: this.id,
        betMoney: this.currentBetMoney,
        memberIndex: this.memberIndex,
      });
      this.currentBetMoney = 0;
    },
    OnNumberInputChange(currentValue) {
      this.currentBetMoney = currentValue;
    },
  },
  computed: {
    // id: 1,
    // name: "fighter1",
    // health: 1,
    // magic: 1,
    // healthBase: 1,
    // magicBase: 1,
    // desc: "test content 1",
    // // 倍率
    // magnification: 1.0,
    id() {
      if (this.fighter) {
        return this.fighter.id;
      } else {
        return "N/A";
      }
    },
    name() {
      if (this.fighter) {
        return this.fighter.name;
      } else {
        return "N/A";
      }
    },
    desc() {
      if (this.fighter) {
        return this.fighter.desc;
      } else {
        return "N/A";
      }
    },
    health() {
      if (this.fighter) {
        return this.fighter.health;
      } else {
        return "N/A";
      }
    },
    magic() {
      if (this.fighter) {
        return this.fighter.magic;
      } else {
        return "N/A";
      }
    },
    magnification() {
      if (this.fighter) {
        return this.fighter.magnification;
      } else {
        return "N/A";
      }
    },
    betedOnThisFighter() {
      let res = false;

      if (this.betInfos) {
        this.betInfos.map((b) => {
          if (b.fighterId == this.id) {
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
.fighter_card {
  width: 25%;
  background-color: white;
}
.bet_fighter_money_input {
  width: 100% !important;
}
</style>