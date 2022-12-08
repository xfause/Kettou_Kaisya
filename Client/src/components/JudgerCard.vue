<template>
  <div class="judger_card">
    <div v-if="this.JudgerCard !== null">
      <div v-if="(this.JudgerCard.IsActive == false)">
        <div>裁判卡</div>
        <div>背面</div>
      </div>
      <div v-else>
        <div>裁判卡</div>
        <div>ID:{{ id }}</div>
        <div>名称:{{ name }}</div>
        <div>描述:{{ desc }}</div>
      </div>
    </div>
    <div v-if="this.JudgerCard == null">
      <div>裁判卡</div>
      <div>空</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "JudgerCard",
  props: {
    JudgerCard: Object, // judger infos
    CurrentStage: String,
  },
  data() {
    return {};
  },
  computed: {
    id() {
      if (this.JudgerCard) {
        return this.JudgerCard.Id;
      } else {
        return "N/A";
      }
    },
    name() {
      if (this.JudgerCard) {
        return this.JudgerCard.Name;
      } else {
        return "N/A";
      }
    },
    desc() {
      if (this.JudgerCard) {
        return this.JudgerCard.Desc;
      } else {
        return "N/A";
      }
    },
  },
};
</script>

<style>
  @import '../assets/styles/JudgerCard.css';
</style>
