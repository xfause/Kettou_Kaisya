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

    <div class="card-bottom">
      {{ str_type }}
    </div>
  </div>
</template>

<script>
export default {
  name: "Card",
  props: {
    index: Number, // 当前卡牌的index
    data: Object, // 卡牌的信息
    area: String, // 所在区域
    OnChooseHandCard: Function, // 选择卡牌的回调
    roomStatus: String, //房间状态
    playerStatus: String, //玩家状态
  },
  data() {
    return {};
  },
  mounted() {
    this.cardDom = this.$refs["cardDom"];
  },
  computed: {
    id() {
      return this.data.id;
    },
    name() {
      return this.data.name;
    },
    desc() {
      return this.data.desc;
    },
    needTarget(){
      return this.data.needTarget;
    },
    targetType(){
      if (this.data.needTarget) {
        return this.data.targetType;
      }
      return null;
    },
    str_type() {
      if (this.data.type == "HIT") {
        return "直击";
      } else if (this.data.type == "EFFECT") {
        return "效果";
      } else {
        return "N/A";
      }
    },
    isNoTargetDrag() {
      return true;
      // if (
      //   this.playerStatus == "NOT_FOLDED" ||
      //   this.playerStatus == "PAID_USE_CARD"
      // ) {
      //   if (this.roomStatus == "CARD") {
      //     if (this.needTarget == true) {
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
    isTargetDrag() {
      // todo
      return false;
      // if (
      //   this.playerStatus == "NOT_FOLDED" ||
      //   this.playerStatus == "PAID_USE_CARD"
      // ) {
      //   if (this.roomStatus == "CARD") {
      //     if (this.needTarget == true) {
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
      if (this.isNoTargetDrag) {
        this.noTargetDrag = false;
        window.noTargetDrag = false;
        this.cardDom.style["transition"] = "all 0s";
        this.cardDom.style["transform"] = `translate(${
          e.pageX
        }px, ${e.pageY}px) scale(1.0)`;
      }
    },
    mouseDown(e) {
      if (this.isNoTargetDrag) {
        this.noTargetDrag = true;
        window.noTargetDrag = true;

        this.cardDom.style["transition"] = "all 0s";

        this.startX = e.pageX;
        this.startY = e.pageY;
        window.cardMoveX = this.startX;
        window.cardMoveY = this.startY;
        window.cardInitX = this.startX;
        window.cardInitY = this.startY;

        this.OnOutCardLoop();
      } else if (this.isTargetDrag) {
        this.$emit("OnClientUseCardStart", {
          startX: e.pageX,
          startY: e.pageY,
          targetType: this.targetType
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
.card {
  position: relative;
  width: 135px;
  height: 170px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: grey;
}

.card-name {
  height: 45px;
  background: #394950;
  color: white;
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
  text-align: center;
  margin-bottom: 15px;
  box-sizing: border-box;
  padding: 8px 0;
  font-weight: bold;
}

.card-desc {
  padding: 0 8px;
}

.card-bottom {
  position: absolute;
  bottom: 0px;
  width: 100%;
  background: #394950;
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  color: white;
  box-sizing: border-box;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
}
</style>>
