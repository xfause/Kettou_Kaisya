<template>
    <div>
        <div>牌库:{{remainCardsNum}}张</div>
    </div>
</template>

<script>
export default {
    name: "MyBasicInfo",
    props: {
        remainCardsNum: Number, // 剩余金钱数
    },
    data(){
        return {}
    },
    computed: {
        
    }
}
</script>

<style>

</style>>
