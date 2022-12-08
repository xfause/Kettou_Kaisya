<template>
  <el-table :key="IsUpdate" :data="TableData" style="width: 100%">
    <el-table-column prop="Rank" label="排名"> </el-table-column>
    <el-table-column prop="PlayerIndex" label="玩家序号"> </el-table-column>
    <el-table-column prop="WinCredit" label="胜点"> </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: "GameEndRankList",
  props: {
    data: Object
  },
  data() {
    // eslint-disable-next-line
    console.log(this.$parent.data.data);
    return {
      IsUpdate: this.$parent.data.IsUpdate,
      TableData: this.$parent.data.data
    }
  }
};
</script>