<template>
    <div>
        <div>牌库剩余:{{RemainCardsNum}}张</div>
    </div>
</template>

<script>
export default {
    name: "RemainCards",
    props: {
        RemainCardsNum: Number, // 剩余金钱数
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
