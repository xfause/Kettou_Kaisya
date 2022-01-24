<template>
    <div class="judger_card">
        <div>judger info</div>
    </div>
</template>

<script>
export default {
    name: "JudgerCard",
    props: {
        judgerCard: Object, // judger infos
    },
    data(){
        return {}
    },
    computed: {
        
    }
}
</script>

<style>
.judger_card{
    width: calc(100% - 40px);
    height: calc(50% - 40px);
    background-color: white;
    margin: 20px;
}
</style>>
