<template>
  <div class="judger_card">
    <div v-if="this.judgerCard !== null">
      <div v-if="this.status == 'PREPARE' || this.status == 'BET'">
        <div>裁判卡</div>
        <div>背面</div>
      </div>
      <div v-else>
        <div>裁判卡</div>
        <div>id:{{ id }}</div>
        <div>name:{{ name }}</div>
        <div>描述:{{ desc }}</div>
      </div>
    </div>
    <div v-if="this.judgerCard == null">
      <div>裁判卡</div>
      <div>空</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "JudgerCard",
  props: {
    judgerCard: Object, // judger infos
    status: String,
  },
  data() {
    return {};
  },
  computed: {
    id() {
      if (this.judgerCard) {
        return this.judgerCard.id;
      } else {
        return "N/A";
      }
    },
    name() {
      if (this.judgerCard) {
        return this.judgerCard.name;
      } else {
        return "N/A";
      }
    },
    desc() {
      if (this.judgerCard) {
        return this.judgerCard.desc;
      } else {
        return "N/A";
      }
    },
  },
};
</script>

<style>
.judger_card {
  width: calc(100% - 40px);
  height: calc(50% - 40px);
  background-color: white;
  margin: 20px;
}
</style>
