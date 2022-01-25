<template>
    <div class="fate_card">
        <div 
            v-if="this.fateCard!=null"
        >
            <div>命运卡</div>
            <div>id:{{id}}</div>
            <div>name:{{name}}</div>
            <div>描述:{{desc}}</div>
        </div>
        <div v-if="this.fateCard==null">
            <div>命运卡</div>
            <div>空</div>
        </div>
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
        id() {
            if (this.fateCard) {
                return this.fateCard.id;
            } else {
                return "N/A"
            }
        },
        name() {
            if (this.fateCard) {
                return this.fateCard.name;
            } else {
                return "N/A"
            }
        },
        desc() {
            if (this.fateCard) {
                return this.fateCard.desc;
            } else {
                return "N/A"
            }
        },
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
