<template>
  <div
    class="table_card"
    :data-k="data.k"
  >
    <div
      v-if="!bIshowCardInfo"
    >
    背面
    </div>
    <div
      v-if="bIshowCardInfo"
    >
      <div class="card-name">{{ name }}</div>
      <div class="card-desc">ID: {{ id }}</div>
      <div class="card-desc">描述: {{ desc }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TableCard",
  props: {
    index: Number, // 当前卡牌的index
    data: Object, // 卡牌的信息
    CurrentStage: String, //房间状态
    CardIndex: Number,
    CurrentTableCardIndex: Number
  },
  data() {
    return {};
  },
  mounted() {
  },
  computed: {
    id() {
      return this.data.Id;
    },
    name() {
      return this.data.Name;
    },
    desc() {
      return this.data.Desc;
    },
    bIshowCardInfo(){
      if (this.CurrentStage !== "JUDGE") {
        if (this.data.IsActive){
          return true;
        } else {
          return false;
        }
      }
      else {
        if (this.CardIndex<=this.CurrentTableCardIndex) {
          return true;
        } else {
          if (this.data.IsActive){
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
  @import '../assets/styles/TableCard.css';
</style>