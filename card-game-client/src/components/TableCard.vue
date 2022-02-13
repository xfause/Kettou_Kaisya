<template>
  <div
    class="table_card"
    :data-k="data.k"
  >
    <div
      v-if="!showCardInfo"
    >
    背面
    </div>
    <div
      v-if="showCardInfo"
    >
      <div class="card-name">{{ name }}</div>
      <div class="card-desc">id: {{ id }}</div>
      <div class="card-desc">desc: {{ desc }}</div>

      <div class="card-bottom">
        {{ str_type }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TableCard",
  props: {
    index: Number, // 当前卡牌的index
    data: Object, // 卡牌的信息
    roomStatus: String, //房间状态
    playerStatus: String, //玩家状态
    cardIndex: Number,
    currentTableCardIndex: Number
  },
  data() {
    return {};
  },
  mounted() {
  },
  computed: {
    id() {
      return this.data.id;
    },
    name() {
      return this.data.name;
    },
    desc() {
      return this.data.desc;
    },
    type(){
      return this.data.type;
    },
    str_type() {
      if (this.data.type == "HIT") {
        return "直击";
      } else if (this.data.type == "EFFECT") {
        return "效果";
      } else {
        return "N/A";
      }
    },
    showCardInfo(){
      if (this.roomStatus !== "JUDGE") {
        if (this.data.type == "HIT"){
          return true;
        } else {
          return false;
        }
      }
      else {
        if (this.cardIndex<=this.currentTableCardIndex) {
          return true;
        } else {
          if (this.data.type == "HIT"){
            return true;
          } else {
            return false;
          }
        }
      }
    }
  },
  methods: {
  },
};
</script>

<style>
.table_card {
  position: relative;
  width: 135px;
  height: 170px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: grey;
}

.card-name {
  height: 45px;
  background: #394950;
  color: white;
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
  text-align: center;
  margin-bottom: 15px;
  box-sizing: border-box;
  padding: 8px 0;
  font-weight: bold;
}

.card-desc {
  padding: 0 8px;
}

.card-bottom {
  position: absolute;
  bottom: 0px;
  width: 100%;
  background: #394950;
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  color: white;
  box-sizing: border-box;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
}
</style>