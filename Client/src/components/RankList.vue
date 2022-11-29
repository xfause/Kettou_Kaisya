<template>
  <el-table :data="tData" style="width: 100%">
    <el-table-column prop="rank" label="排名"> </el-table-column>
    <el-table-column prop="memberIndex" label="User Index"> </el-table-column>
    <el-table-column prop="money" label="Money"> </el-table-column>
  </el-table>
</template>

  <script>
export default {
  name: "RankList",
  props: {
    data:Object
  },
  data() {
    // eslint-disable-next-line
    console.log(this.$parent.data);
      return {
        tData: this.$parent.data
      }
    }
};
</script>