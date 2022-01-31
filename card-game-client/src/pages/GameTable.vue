<template>
  <div class="app">
    <div class="table">
      <div class="top_area">
        <transition-group
          class="other_player_area"
          tag="div"
          :css="false"
          @enter="enter"
          @before-enter="beforeEnter"
          @after-enter="afterEnter"
        >
          <OtherPlayerInfo
            :key="p.memberIndex"
            :index="index"
            :money="p.money"
            :memberIndex="p.memberIndex"
            :handCardsNum="p.handCardsNum"
            :status="p.status"
            v-for="(p, index) in gameData.otherPlayerList"
          />
        </transition-group>

        <div class="room_info_area">
          <RoomInfo
            :currentRound="gameData.currentRound"
            :roundNumLimit="gameData.roundNumLimit"
            :jackpot="gameData.jackpot"
            :status="gameData.status"
          />
        </div>
      </div>

      <div class="table_area">
        <div class="fate_judger_area">
          <JudgerCard :judgerCard="gameData.judgerCard" />

          <FateCard :fateCard="gameData.fateCard" />
        </div>

        <transition-group
          class="fighters_area"
          tag="div"
          :css="false"
          @enter="enter"
          @before-enter="beforeEnter"
          @after-enter="afterEnter"
        >
          <FighterCard
            :key="f.id"
            :index="f.id"
            :data-id="f.id"
            :status="gameData.myInfos.status"
            :roomStatus="gameData.status"
            :memberIndex="gameData.memberIndex"
            :roomNumber="gameData.roomNumber"
            :money="gameData.myInfos.money"
            :betInfos="gameData.betInfos"
            :fighterBetInfos="GetFighterBetInfos(f.id)"
            :fighter="f"
            v-for="f in gameData.fightersInfo"
          />
        </transition-group>

        <div class="table_cards_area">table card list</div>
      </div>

      <div class="my_area">
        <div class="my_basic_info">
          <MyBasicInfo
            v-if="gameData.myInfos"
            :memberIndex="gameData.myInfos.memberIndex"
            :status="gameData.myInfos.status"
            :money="gameData.myInfos.money"
            :roomStatus="gameData.status"
            :betInfos="gameData.betInfos"
            :roomNumber="gameData.roomNumber"
            :currentPlayerIndex="gameData.currentPlayerIndex"
            :checkCardFee="gameData.checkCardFee"
          />
        </div>

        <transition-group
          class="my_hand_cards"
          tag="div"
          :css="false"
          @enter="enter"
          @before-enter="beforeEnter"
          @after-enter="afterEnter"
        >
          <Card
            :key="c.k"
            :index="index"
            :data="c"
            :area="`hand`"
            @OnClientUseCardStart="OnClientUseCardStart"
            :OnChooseHandCard="OnChooseHandCard"
            :roomStatus="gameData.status"
            :playerStatus="gameData.myInfos.status"
            v-for="(c, index) in gameData.handCards"
          />
        </transition-group>

        <div class="my_remain_cards_info">
          <RemainCards :remainCardsNum="gameData.remainCardsNum" />
        </div>
      </div>

      <div class="match-dialog-container" v-show="matchDialogShow">
        正在匹配，请等待
      </div>

      <canvas
        id="animationCanvas"
        v-show="showCanvas"
        :width="windowWidth"
        :height="windowHeight"
      >
      </canvas>
    </div>
  </div>
</template>

<script>
// import * as io from "socket.io-client";
import RoomInfo from "../components/RoomInfo";
import MyBasicInfo from "../components/MyBasicInfo";
import OtherPlayerInfo from "../components/OtherPlayerInfo";
import RemainCards from "../components/RemainCards";
import JudgerCard from "../components/JudgerCard";
import FateCard from "../components/FateCard";
import FighterCard from "../components/FighterCard";
import Card from "../components/Card";
import Velocity from "velocity-animate";

export default {
  name: "GameTable",
  components: {
    RoomInfo,
    MyBasicInfo,
    OtherPlayerInfo,
    RemainCards,
    Card,
    JudgerCard,
    FateCard,
    FighterCard,
  },

  // table page data structs
  data() {
    return {
      matchDialogShow: false,
      // todo
      count: 0,
      userId: new Date().getTime(),
      showCanvas: false,

      windowWidth: 1920,
      windowHeight: 1080,

      // for use card
      // temp variable
      currentChosenHandCardId: -1,

      // show rank list
      showRankList: false,

      gameData: {
        memberIndex: -1,
        roomNumber: "-1",
        checkCardFee: -1,

        rankList: [],

        jackpot: 0,
        status: "",
        currentRound: 0,
        roundNumLimit: 0,
        currentPlayerIndex: -1,
        judgerCard: null,
        fateCard: null,

        winnerFighterIndex: -1,
        // 玩家下注给几号fighter 下注了多少钱
        betInfos: [],
        fightersInfo: [],

        tableCards: [],
        preUseCardFee: -1,
        preUseCardPlayerIndex: -1,
        handCards: [],
        remainCardsNum: -1,
        otherPlayerList: [],
        myInfos: null,
      },
    };
  },

  updated(){
    this.myHandCardsAreaDom = document.querySelector(".my_hand_cards");
    this.otherPlayerAreaDom = document.querySelector(".other_player_area");
    this.tableAreaDom = document.querySelector(".table_cards_area");
    this.fighterAreaDom = document.querySelector(".fighters_area");
  },

  mounted() {
    // this.sockets = io.connect("http://localhost:4001");
    this.$socket.open();

    // connect to room
    this.$socket.emit("COMMAND", {
      type: "CONNECT",
      userId: this.userId,
    });

    // wait in queue
    this.sockets.subscribe("WAITE", () => {
      this.matchDialogShow = true;
    });

    // game start
    this.sockets.subscribe("START", (result) => {
      this.matchDialogShow = false;
      this.gameData.roomNumber = result.roomNumber;
    });

    // reconnect to game
    this.sockets.subscribe("RECONNECT", (result) => {
      this.gameData.roomNumber = result.roomNumber;
      this.gameData.memberIndex = result.memberIndex;
    });
    this.sockets.subscribe("RESTORE_DATA", (result) => {
      this.RestoreGameData(result);
    });

    // game start initial data
    this.sockets.subscribe("INIT_DATA", (result) => {
      this.SetInitGameData(result);
    });

    // player bet on fighters change
    this.sockets.subscribe("AFTER_BET_DATA", (result) => {
      this.OnPlayerBetFighters(result);
    });

    // change room stage
    this.sockets.subscribe("CHANGE_ROOM_STAGE", (result) => {
      this.OnChangeRoomStage(result);
    });

    // my check card
    this.sockets.subscribe("MY_CHECK_CARD", (result) => {
      this.OnMyCheckCard(result);
    });

    // other check card
    this.sockets.subscribe("OTHER_CHECK_CARD", (result) => {
      this.OnOtherCheckCard(result);
    });

    // player fold card
    this.sockets.subscribe("FOLD_CARD", (result) => {
      this.OnPlayerFoldCard(result);
    });

    // my use card
    this.sockets.subscribe("MY_USE_CARD", (result) => {
      this.OnMyUseCard(result);
    });

    // other use card
    this.sockets.subscribe("OTHER_USE_CARD", (result) => {
      this.OnOtherUseCard(result);
    });

    // player end use card
    this.sockets.subscribe("END_USE_CARD", (result) => {
      this.OnEndUseCard(result);
    });

    // judge stage -> init fighters
    this.sockets.subscribe("JUDGE_INIT_FIGHTERS", (result) => {
      this.OnJudgeStageInitFighters(result);
    });

    // judge stage -> active card
    this.sockets.subscribe("JUDGE_ACTIVE_CARD", (result) => {
      this.OnJudgeStageActiveCard(result);
    });

    // get winner fighter index
    this.sockets.subscribe("WINNER_FIGHTER", (result) => {
      this.GetWinnerFighter(result);
    });

    // after all rounds game end
    this.sockets.subscribe("GAME_END", (result) => {
      this.OnGameEnd(result);
    });

    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    window.onresize = () => {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    };
    this.RegisterUseCardEvent();

  },

  methods: {
    beforeEnter(el) {
      el.style["transition"] = "all 0s";
      el.style.opacity = 0;
    },
    enter(el, done) {
      Velocity(el, { scale: 1.3 }, { duration: 10 })
        .then((el) => {
          return Velocity(el, { opacity: 1 }, { duration: 300 });
        })
        .then((el) => {
          return Velocity(
            el,
            { scale: 1 },
            {
              duration: 200,
              complete() {
                done();
              },
            }
          );
        });
    },
    afterEnter(el) {
      el.style["transition"] = "all 0.2s";
      el.style.opacity = 1;
      el.style.transform = "";
    },

    OnChooseHandCard(id) {
      this.currentChosenHandCardId = id;
    },

    OnClientUseCardStart({ startX, startY,  targetType }) {
      this.showCanvas = true;
      window.targetDrag = true;
      window.targetType = targetType;
      this.useCardStartX = startX;
      this.useCardStartY = startY;
    },

    RegisterUseCardEvent() {
      this.canvasContext = document
        .querySelector("#animationCanvas")
        .getContext("2d");

      window.onmousemove = (e) => {
        if (window.noTargetDrag) {
          window.cardMoveX = e.pageX;
          window.cardMoveY = e.pageY;
        }
        if (window.targetDrag) {
          window.requestAnimationFrame(() => {
            // 绘制攻击箭头开始
            this.canvasContext.clearRect(
              0,
              0,
              this.windowWidth,
              this.windowHeight
            );
            this.canvasContext.strokeStyle = "maroon";
            this.canvasContext.fillStyle = "maroon";

            this.canvasContext.save();
            this.canvasContext.setLineDash([40, 10]);
            this.canvasContext.lineWidth = 30;

            this.canvasContext.beginPath();
            this.canvasContext.moveTo(this.useCardStartX, this.useCardStartY);
            this.canvasContext.lineTo(e.pageX, e.pageY);
            this.canvasContext.fill();
            this.canvasContext.stroke();
            this.canvasContext.restore();

            this.canvasContext.save();
            this.canvasContext.beginPath();
            this.canvasContext.lineCap = "square";
            this.canvasContext.translate(e.pageX, e.pageY);
            let getLineRadians = () => {
              // 计算直线当前的角度
              let _a = e.pageX - this.useCardStartX;
              let _b = e.pageY - this.useCardStartY;
              let _c = Math.hypot(_a, _b);
              return Math.acos(_a / _c) * Math.sign(_b);
            };
            this.canvasContext.rotate(getLineRadians() - Math.PI / 2);
            this.canvasContext.moveTo(35, -40);
            this.canvasContext.lineTo(0, 25);
            this.canvasContext.lineTo(-35, -40);
            this.canvasContext.lineTo(35, -40);
            this.canvasContext.fill();
            this.canvasContext.stroke();
            this.canvasContext.restore();
            // 绘制攻击箭头结束
          });
        }
      };

      window.onmouseup = (e) => {
        if (window.noTargetDrag && this.currentChosenHandCardId !== -1) {
          window.noTargetDrag = false;
          this.showCanvas = false;
          let top = this.tableAreaDom.offsetTop,
            width = this.tableAreaDom.offsetWidth,
            left = this.tableAreaDom.offsetLeft,
            height = this.tableAreaDom.offsetHeight;
          

          let x = e.pageX,
            y = e.pageY;

          if (x > left && x < left + width && y > top && y < top + height) {
            console.log("use no target card success", this.currentChosenHandCardId);
            console.log("card id:", this.currentChosenHandCardId);
            // todo
          }

          window.cardMoveX = window.cardInitX;
          window.cardMoveY = window.cardInitY;
        }

        if (window.targetDrag && this.currentChosenHandCardId !== -1) {
          window.targetDrag = false;
          this.showCanvas = false;
          this.canvasContext.clearRect(
            0,
            0,
            this.windowWidth,
            this.windowHeight
          );

          // get current card need target
          // check target type dom
          // check if have target index

          let x = e.pageX, // 鼠标松开的x
            y = e.pageY, // 鼠标松开的y
            k = -1; // 用于记录找到的卡牌的index

            let targetAreaDom;
            if (window.targetType == "table") {
              targetAreaDom = this.tableAreaDom; 
            }
            if (window.targetType == "fighter") {
              targetAreaDom = this.fighterAreaDom;
            }
            if (window.targetType == "player") {
              targetAreaDom = this.otherPlayerAreaDom;
            }
            if (window.targetType == null) {
              return;
            }

            let items = [...targetAreaDom.childNodes];
            
            items.map((cd)=>{
                let top = cd.offsetTop,
                width = cd.offsetWidth,
                left = cd.offsetLeft,
                height = cd.offsetHeight;

                if (x > left && x < left + width && y > top && y < top + height) {
                  // 边缘检测
                  k = cd.dataset.id;
                  console.log("use target card success");
                  console.log("card id:" , this.currentChosenHandCardId);
                  console.log("target id:" , k);
                  // todo
                }
            })
        }
      };
    },

    RestoreGameData(result) {
      const {
        jackpot,
        status,
        currentRound,
        roundNumLimit,
        checkCardFee,
        currentPlayerIndex,
        judgerCard,
        fateCard,
        fightersInfo,
        tableCards,
        preUseCardFee,
        preUseCardPlayerIndex,
        handCards,
        remainCardsNum,
        myInfos,
        otherPlayerList,
      } = result;
      this.gameData.jackpot = jackpot;
      this.gameData.status = status;
      this.gameData.currentRound = currentRound;
      this.gameData.roundNumLimit = roundNumLimit;
      this.gameData.checkCardFee = checkCardFee;
      this.gameData.currentPlayerIndex = currentPlayerIndex;
      this.gameData.judgerCard = judgerCard;
      this.gameData.fateCard = fateCard;
      this.gameData.fightersInfo = fightersInfo.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
      this.gameData.tableCards = tableCards;
      this.gameData.preUseCardFee = preUseCardFee;
      this.gameData.preUseCardPlayerIndex = preUseCardPlayerIndex;
      this.gameData.handCards = handCards.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
      this.gameData.remainCardsNum = remainCardsNum;
      this.gameData.myInfos = myInfos;
      this.gameData.memberIndex = myInfos.memberIndex;
      this.gameData.otherPlayerList = otherPlayerList;
    },

    SetInitGameData(result) {
      const {
        jackpot,
        status,
        currentRound,
        roundNumLimit,
        checkCardFee,
        roomNumber,
        currentPlayerIndex,
        judgerCard,
        fateCard,
        fightersInfo,
        tableCards,
        preUseCardFee,
        preUseCardPlayerIndex,
        handCards,
        remainCardsNum,
        myInfos,
        otherPlayerList,
      } = result;
      this.gameData.jackpot = jackpot;
      this.gameData.status = status;
      this.gameData.roomNumber = roomNumber;
      this.gameData.currentRound = currentRound;
      this.gameData.roundNumLimit = roundNumLimit;
      this.gameData.checkCardFee = checkCardFee;
      this.gameData.currentPlayerIndex = currentPlayerIndex;
      this.gameData.judgerCard = judgerCard;
      this.gameData.fateCard = fateCard;
      this.gameData.fightersInfo = fightersInfo.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
      this.gameData.tableCards = tableCards;
      this.gameData.preUseCardFee = preUseCardFee;
      this.gameData.preUseCardPlayerIndex = preUseCardPlayerIndex;
      this.gameData.handCards = handCards.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
      this.gameData.remainCardsNum = remainCardsNum;
      this.gameData.myInfos = myInfos;
      this.gameData.memberIndex = myInfos.memberIndex;
      this.gameData.otherPlayerList = otherPlayerList;
    },

    OnPlayerBetFighters(result) {
      // playerBetStatus:{
      //     status, memberIndex
      //     userId, money,
      //     betInfos
      //     currentPlayerIndex
      // }
      const { fightersInfo, playerBetStatus } = result;
      this.gameData.fightersInfo = fightersInfo.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });

      playerBetStatus.map((p) => {
        if (p.memberIndex == this.gameData.memberIndex) {
          // my bet
          this.gameData.myInfos.status = p.status;
          this.gameData.myInfos.money = p.money;
          this.gameData.currentPlayerIndex = p.currentPlayerIndex;
          this.gameData.betInfos = p.betInfos;
        } else {
          // other player bet
          const pIndex = this.gameData.otherPlayerList.findIndex(
            (obj) => obj.memberIndex == p.memberIndex
          );
          this.gameData.otherPlayerList[pIndex].money = p.money;
          this.gameData.otherPlayerList[pIndex].status = p.status;
          this.gameData.currentPlayerIndex = p.currentPlayerIndex;
        }
      });
    },

    OnChangeRoomStage(result) {
      const { status } = result;
      this.gameData.status = status;
      if (status == "CARD") {
        const { fateCard, playerStatus } = result;
        this.gameData.fateCard = fateCard;
        this.gameData.myInfos.status = playerStatus;
      } else if (status == "JUDGE") {
        const { playerStatus } = result;
        this.gameData.myInfos.status = playerStatus;
      }
      // else if (status == "CALC") {
      // }
    },

    OnMyCheckCard(result) {
      // handCards,remainCardsNum,
      // money, jackpot, currentPlayerIndex
      const { handCards, remainCardsNum, money, jackpot, currentPlayerIndex } =
        result;
      this.gameData.handCards = handCards.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
      this.gameData.remainCardsNum = remainCardsNum;
      this.gameData.myInfos.money = money;
      this.gameData.jackpot = jackpot;
      this.gameData.currentPlayerIndex = currentPlayerIndex;
    },

    OnOtherCheckCard(result) {
      // jackpot,
      // prePlayerIndex,
      // money,
      // handCardsNum
      // currentPlayerIndex
      const {
        jackpot,
        prePlayerIndex,
        money,
        handCardsNum,
        currentPlayerIndex,
      } = result;
      this.gameData.jackpot = jackpot;
      this.gameData.currentPlayerIndex = currentPlayerIndex;
      let changedPlayerIndex = this.gameData.otherPlayerList.findIndex(
        (obj) => obj.memberIndex == prePlayerIndex
      );
      this.gameData.otherPlayerList[changedPlayerIndex].money = money;
      this.gameData.otherPlayerList[changedPlayerIndex].handCardsNum =
        handCardsNum;
    },

    OnPlayerFoldCard(result) {
      // preFoldPlayerIndex,currentPlayerIndex
      const { preFoldPlayerIndex, currentPlayerIndex, playerStatus } = result;
      let pIndex = this.gameData.otherPlayerList.findIndex(
        (obj) => obj.memberIndex == preFoldPlayerIndex
      );
      this.gameData.otherPlayerList[pIndex].status = "FOLDED";
      this.gameData.currentPlayerIndex = currentPlayerIndex;
      this.gameData.myInfos.status = playerStatus;
    },

    OnMyUseCard(result) {
      // tableCards, handCards, jackpot, status
      const { tableCards, handCards, jackpot, status } = result;
      this.gameData.tableCards = tableCards;
      if (!this.gameData.myInfos) {
        this.gameData.myInfos = { status };
      } else {
        this.gameData.myInfos.status = status;
      }
      this.gameData.handCards = handCards.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
      this.gameData.jackpot = jackpot;
    },

    OnOtherUseCard(result) {
      // useCardPlayerIndex,useCardPlayerHandCardsNumber,
      // jackpot,preUseCardFee,tableCards
      const {
        useCardPlayerIndex,
        useCardPlayerHandCardsNumber,
        useCardPlayerStatus,
        jackpot,
        preUseCardFee,
        tableCards,
      } = result;
      this.gameData.jackpot = jackpot;
      this.gameData.preUseCardFee = preUseCardFee;
      this.gameData.tableCards = tableCards;
      let pIndex = this.gameData.otherPlayerList.findIndex(
        (obj) => obj.memberIndex == useCardPlayerIndex
      );
      this.gameData.otherPlayerList[pIndex].status = useCardPlayerStatus;
      this.gameData.otherPlayerList[pIndex].handCardsNum =
        useCardPlayerHandCardsNumber;
    },

    OnEndUseCard(result) {
      // status currentPlayerIndex
      const { status, currentPlayerIndex } = result;
      if (currentPlayerIndex == this.gameData.memberIndex) {
        this.gameData.myInfos.status = status;
      } else {
        let pIndex = this.gameData.otherPlayerList.findIndex(
          (obj) => obj.memberIndex == currentPlayerIndex
        );
        this.gameData.otherPlayerList[pIndex].status = status;
      }
    },

    OnJudgeStageInitFighters(result) {
      const { fightersInfo } = result;
      this.gameData.fightersInfo = fightersInfo.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
    },

    OnJudgeStageActiveCard(result) {
      const {
        jackpot,
        status,
        currentRound,
        judgerCard,
        fateCard,
        fightersInfo,
        tableCards,
        // preUseCardFee, preUseCardPlayerIndex, currentPlayerIndex,
        handCards,
        remainCardsNum,
        otherPlayerList,
      } = result;
      this.gameData.jackpot = jackpot;
      this.gameData.status = status;
      this.gameData.currentRound = currentRound;
      this.gameData.judgerCard = judgerCard;
      this.gameData.fateCard = fateCard;
      this.gameData.fightersInfo = fightersInfo.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
      this.gameData.tableCards = tableCards;
      this.gameData.handCards = handCards.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
      this.gameData.remainCardsNum = remainCardsNum;
      this.gameData.otherPlayerList = otherPlayerList;
    },

    GetWinnerFighter(result) {
      // winnerFighterIndex
      this.gameData.winnerFighterIndex = result.winnerFighterIndex;
    },

    OnGameEnd(result) {
      // rankList
      this.showRankList = true;
      this.gameData.rankList = result.rankList;
    },

    GetFighterBetInfos(id) {
      let res = [];
      this.gameData.fightersInfo.map((p) => {
        if (p.id == id) {
          res = p.betInfos;
        }
      });
      return res;
    },
  },
};
</script>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
}

.table {
  width: 100%;
  height: 100%;
}

.match-dialog-container {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
}

.top_area {
  width: 100%;
  height: 20%;
}

.room_info_area {
  width: 40%;
  height: 100%;
  background-color: rgb(251, 84, 84);
  float: right;
}

.other_player_area {
  width: 60%;
  height: 100%;
  display: flex;
  padding: 10px;
  justify-content: center;
  box-sizing: border-box;
  flex-wrap: wrap;
  background-color: #00f;
  float: left;
  column-gap: 10px;
}

.my_area {
  width: 100%;
  height: 25%;
  min-height: 170px;
  position: absolute;
  bottom: 0px;
  /* display: flex; */
  padding: 10px;
  box-sizing: border-box;
  /* justify-content: center; */
  background-color: #0f0;
}

.my_basic_info {
  background-color: grey;
  width: 200px;
  height: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
}

.my_remain_cards_info {
  background-color: grey;
  width: 200px;
  height: 100%;
  position: absolute;
  right: 0px;
  top: 0px;
}

.my_hand_cards {
  height: 100%;
  margin-left: 200px;
  margin-right: 200px;
  background-color: white;
  display: flex;
  padding: 10px;
  justify-content: center;
  box-sizing: border-box;
  flex-wrap: wrap;
  column-gap: 10px;
  row-gap: 10px;
}

.table_area {
  background-color: rgb(31, 255, 255);
  height: 55%;
  width: 100%;
}

.fate_judger_area {
  background-color: rgb(109, 58, 250);
  width: 12.5%;
  height: 100%;
  float: left;
}

.fighters_area {
  background-color: rgb(250, 58, 250);
  height: 100%;
  margin-left: 12.5%;
  margin-right: 55%;
  display: flex;
  padding: 10px;
  justify-content: center;
  box-sizing: border-box;
  flex-wrap: wrap;
  column-gap: 10px;
  row-gap: 10px;
}

.table_cards_area {
  background-color: rgb(215, 250, 58);
  width: 55%;
  position: absolute;
  right: 0px;
  top: 20%;
  height: 55%;
}

#animationCanvas {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 999;
}
</style>