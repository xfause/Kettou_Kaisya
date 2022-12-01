<template>
  <div
    ref="cardDom"
    class="card"
    @mousedown="mouseDown($event)"
    @mouseup="mouseUp($event)"
    :data-k="data.k"
  >
    <div class="card-name">{{ name }}</div>
    <div class="card-desc">id: {{ id }}</div>
    <div class="card-desc">desc: {{ desc }}</div>
  </div>
</template>

<script>
export default {
  name: "Card",
  props: {
    index: Number, // 当前卡牌的index
    data: Object, // 卡牌的信息
    OnChooseHandCard: Function, // 选择卡牌的回调
    CurrentRoomStage: String, //房间状态
    PlayerStatus: String, //玩家状态
  },
  data() {
    return {};
  },
  mounted() {
    this.cardDom = this.$refs["cardDom"];
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
    IsNeedTarget(){
      return this.data.IsNeedTarget;
    },
    targetType(){
      if (this.data.TargetType) {
        return this.data.TargetType;
      }
      return null;
    },
    IsNoTargetDrag() {
      return false;
      // if (
      //   this.playerStatus == "NOT_FOLDED") {
      //   if (this.CurrentRoomStage == "CARD") {
      //     if (this.IsNeedTarget == true) {
      //       return false;
      //     } else {
      //       return true;
      //     }
      //   } else {
      //     return false;
      //   }
      // } else {
      //   return false;
      // }
    },
    IsTargetDrag() {
      return true;
      // if (
      //   this.playerStatus == "NOT_FOLDED") {
      //   if (this.roomStatus == "CARD") {
      //     if (this.IsNeedTarget == true) {
      //       return true;
      //     } else {
      //       return false;
      //     }
      //   } else {
      //     return false;
      //   }
      // } else {
      //   return false;
      // }
    },
  },
  methods: {
    mouseUp(e){
      if (this.IsNoTargetDrag) {
        this.noTargetDrag = false;
        this.cardDom.style["transition"] = "all 0s";
        this.cardDom.style["transform"] = `translate(${
          e.pageX
        }px, ${e.pageY}px) scale(1.0)`;
      }
    },
    mouseDown(e) {
      if (this.IsNoTargetDrag) {
        this.noTargetDrag = true;
        window.IsNoTargetDrag = true;

        this.cardDom.style["transition"] = "all 0s";

        this.startX = e.pageX;
        this.startY = e.pageY;
        window.cardMoveX = this.startX;
        window.cardMoveY = this.startY;
        window.cardInitX = this.startX;
        window.cardInitY = this.startY;

        this.OnOutCardLoop();
      } else if (this.IsTargetDrag) {
        window.IsTargetDrag = true;
        window.HandCardTargetType = this.targetType;

        this.$emit("OnClientUseCardStart", {
          startX: e.pageX,
          startY: e.pageY,
        });
      }

      if (this.OnChooseHandCard) {
        this.OnChooseHandCard(this.id, e);
      }
    },
    OnOutCardLoop() {
      if (this.noTargetDrag) {
        requestAnimationFrame(this.OnOutCardLoop);
        this.cardDom.style["transform"] = `translate(${
          window.cardMoveX - this.startX
        }px, ${window.cardMoveY - this.startY}px) scale(1.1)`;
      } else {
        this.cardDom.style["transform"] = "";
      }
    },
  },
};
</script>

<style>
  @import '../assets/styles/Card.css'
</style>
