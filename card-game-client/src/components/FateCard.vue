<template>
    <div class="fate_card">
        <div>fate card info</div>
    </div>
</template>

<script>
export default {
    name: "FateCard",
    props: {
        fateCard: Object, // judger infos
    },
    data(){
        return {}
    },
    computed: {
        
    }
}
</script>

<style>
.fate_card {
    width: calc(100% - 40px);
    height: calc(50% - 40px);
    background-color: white;
    margin: 20px;
}
</style>>
