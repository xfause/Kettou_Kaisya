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
              this.PlayerStatus == `NOT_BETED` &&
              this.GameCurrStage == `BET` &&
              PlayerIndex == CurrentPlayerIndex &&
              IsCreditEnoughBetOnce &&
              IsOverMaxBetCount
            "
          >
            <el-button @click="this.OnBetFighter">
              下注
            </el-button>
            <div>已下注:{{CreditBetOnCurrFighter}}</div>
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

export default {
  name: "FighterCard",
  props: {
    Fighter: Object, // fighter infos
    PlayerStatus: String, // player status
    GameCurrStage: String, // room status
    PlayerTempCredit: Number,
    MinBetCredit: Number,
    PlayerIndex: Number,
    CurrentPlayerIndex: Number,
    RoomNumber: String,
    BetDetails: Array,
    FighterBetDetails: Array,
    FighterStatusList: Array,
    MaxBetFighterCount: Number,
  },
  data() 
  {
    return {};
  },
  created() { },
  mounted() { },
  methods: 
  {
    GetBuffDesc(s)
    {
      let t = this.FighterStatusList.find(x => x.name === s);
      if (t==undefined) 
      {
        return s;
      } 
      else 
      {
        return t.desc;
      }
    },
    OnBetFighter() 
    {
      // TODO
      向服务器发送下注指令
      this.$socket.emit("COMMAND", {
        type: "BET_ON_FIGHTER",
        RoomNumber: this.RoomNumber,
        FighterId: this.id,
        PlayerIndex: this.PlayerIndex,
      });
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
    IsCreditEnoughBetOnce() 
    {
      if (this.PlayerTempCredit < this.MinBetCredit)
      {
        return false;
      }
      return true;
    },
    IsOverMaxBetCount()
    {
      if (this.BetDetails.length < MaxBetFighterCount)
      {
        return true;
      }
      return false;
    },
    CreditBetOnCurrFighter()
    {
      let temp = 0;
      this.BetDetails.map(b=>{
        if (b.FighterId == this.id)
        {
          temp = b.BetCredit;
        }
      })
      return temp;
    }
  },
};
</script>

<style>
  @import '../assets/styles/FighterCard.css';
</style>