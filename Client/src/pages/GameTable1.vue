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
          <JudgerCard 
            :judgerCard="gameData.judgerCard"
            :status="gameData.status" 
          />
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
            :currentPlayerIndex="gameData.currentPlayerIndex"
            :roomNumber="gameData.roomNumber"
            :fighterStatusList="gameData.fighterStatusList"
            :money="gameData.myInfos.money"
            :betInfos="gameData.betInfos"
            :fighterBetInfos="GetFighterBetInfos(f.id)"
            :fighter="f"
            v-for="f in gameData.fightersInfo"
          />
        </transition-group>

        <transition-group
          class="table_cards_area"
          tag="div"
          :css="false"
          @enter="enter"
          @before-enter="beforeEnter"
          @after-enter="afterEnter"
        >
          <TableCard
            :key="c.k"
            :index="index"
            :data-id="index"
            :data="c"
            :roomStatus="gameData.status"
            :playerStatus="gameData.myInfos.status"
            :currentTableCardIndex="gameData.currentTableCardIndex"
            :cardIndex="index"
            v-for="(c, index) in gameData.tableCards"
          />
        </transition-group>
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
import FighterCard from "../components/FighterCard";
import Card from "../components/Card";
import TableCard from "../components/TableCard";
import RankList from "../components/RankList"
import Velocity from "velocity-animate";

export default {
  name: "GameTable",
  components: {
    RoomInfo,
    MyBasicInfo,
    OtherPlayerInfo,
    RemainCards,
    Card,
    TableCard,
    JudgerCard,
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

      gameData: {
        memberIndex: -1,
        roomNumber: "-1",
        checkCardFee: -1,

        fighterStatusList: [],

        rankList: [],

        jackpot: 0,
        status: "",
        currentRound: 0,
        roundNumLimit: 0,
        currentPlayerIndex: -1,
        judgerCard: null,

        currentTableCardIndex: -1,

        winnerFighterId: -1,
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

  updated() {
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

    this.sockets.subscribe("OUT_HAND_CARDS_NUM", (result) => {
      this.OnOutHandCardsCheck(result);
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

    // get winner fighter id
    this.sockets.subscribe("WINNER_FIGHTER_ID", (result) => {
      this.GetWinnerFighter(result);
    });

    // get win money
    this.sockets.subscribe("WIN_MONEY", (result) => {
      this.ShowWinMoney(result);
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

    OnClientUseCardStart({ startX, startY, targetType }) {
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
            if (this.gameData.myInfos.status != "PAID_USE_CARD") {
              // comfirm
              // input first use card fee
              // todo
              this.$prompt("请输入本回合初次出牌金额", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputValidator: (value) => {
                  if (!new RegExp("^[0-9]*[1-9][0-9]*$").test(value)) {
                    return "必须是正整数";
                  }
                  if (value <= 0) {
                    return "出牌金额必须大于0";
                  } else if (value < this.gameData.preUseCardFee) {
                    return (
                      "上一次出牌金额为:" +
                      this.gameData.preUseCardFee +
                      ", 必须大于它"
                    );
                  }
                },
              })
                .then(async ({ value }) => {
                  this.$socket.emit("COMMAND", {
                    type: "USE_CARD",
                    roomNumber: this.gameData.roomNumber,
                    memberIndex: this.gameData.memberIndex,
                    cardId: this.currentChosenHandCardId,
                    useCardFee: parseInt(value),
                    needTarget: false,
                    targetType: "N/A",
                    targetId: -1,
                  });
                })
                .catch(() => {
                  this.$message({
                    type: "info",
                    message: "取消出牌",
                  });
                });
            } else {
              this.$socket.emit("COMMAND", {
                type: "USE_CARD",
                roomNumber: this.gameData.roomNumber,
                memberIndex: this.gameData.memberIndex,
                cardId: this.currentChosenHandCardId,
                useCardFee: -1,
                needTarget: false,
                targetType: "N/A",
                targetId: -1,
              });
            }
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

          items.map((cd) => {
            let top = cd.offsetTop,
              width = cd.offsetWidth,
              left = cd.offsetLeft,
              height = cd.offsetHeight;

            if (x > left && x < left + width && y > top && y < top + height) {
              if (this.gameData.myInfos.status != "PAID_USE_CARD") {
                // comfirm
                // input first use card fee
                k = cd.dataset.id;
                this.$prompt("请输入本回合初次出牌金额", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  inputValidator: (value) => {
                    if (!new RegExp("^[0-9]*[1-9][0-9]*$").test(value)) {
                      return "必须是正整数";
                    }
                    if (value <= 0) {
                      return "出牌金额必须大于0";
                    } else if (value < this.gameData.preUseCardFee) {
                      return (
                        "上一次出牌金额为:" +
                        this.gameData.preUseCardFee +
                        ", 必须大于它"
                      );
                    }
                  },
                })
                  .then(async ({ value }) => {
                    let cI = this.gameData.handCards.findIndex(
                      (obj) => obj.id == this.currentChosenHandCardId
                    );
                    this.$socket.emit("COMMAND", {
                      type: "USE_CARD",
                      roomNumber: this.gameData.roomNumber,
                      memberIndex: this.gameData.memberIndex,
                      cardId: this.currentChosenHandCardId,
                      useCardFee: parseInt(value),
                      needTarget: true,
                      targetType: this.gameData.handCards[cI].targetType,
                      targetId: k,
                    });
                  })
                  .catch(() => {
                    this.$message({
                      type: "info",
                      message: "取消出牌",
                    });
                  });
              } else {
                k = cd.dataset.id;
                // console.log("use target card success");
                // console.log("card id:" , this.currentChosenHandCardId);
                // console.log("target id:" , k);

                let cI = this.gameData.handCards.findIndex(
                  (obj) => obj.id == this.currentChosenHandCardId
                );
                this.$socket.emit("COMMAND", {
                  type: "USE_CARD",
                  roomNumber: this.gameData.roomNumber,
                  memberIndex: this.gameData.memberIndex,
                  cardId: this.currentChosenHandCardId,
                  useCardFee: -1,
                  needTarget: true,
                  targetType: this.gameData.handCards[cI].targetType,
                  targetId: k,
                });
              }
            }
          });
        }
      };
    },

    RestoreGameData(result) {
      const {
        jackpot,
        status,
        fighterStatusList,
        currentRound,
        roundNumLimit,
        checkCardFee,
        currentPlayerIndex,
        judgerCard,
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
      this.gameData.fighterStatusList = fighterStatusList || [];
      this.gameData.currentRound = currentRound;
      this.gameData.roundNumLimit = roundNumLimit;
      this.gameData.checkCardFee = checkCardFee;
      this.gameData.currentPlayerIndex = currentPlayerIndex;
      this.gameData.judgerCard = judgerCard;
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
        fighterStatusList,
        currentRound,
        roundNumLimit,
        checkCardFee,
        roomNumber,
        currentPlayerIndex,
        judgerCard,
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
      this.gameData.fighterStatusList = fighterStatusList || [];
      this.gameData.roomNumber = roomNumber;
      this.gameData.currentRound = currentRound;
      this.gameData.roundNumLimit = roundNumLimit;
      this.gameData.checkCardFee = checkCardFee;
      this.gameData.currentPlayerIndex = currentPlayerIndex;
      this.gameData.judgerCard = judgerCard;
      this.gameData.fightersInfo = fightersInfo.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
      this.gameData.betInfos = [];
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
      //     status, statusList, memberIndex
      //     userId, money, jackpot
      //     betInfos
      //     currentPlayerIndex
      // }
      const { fightersInfo, playerBetStatus, jackpot } = result;

      this.gameData.fightersInfo = fightersInfo.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });

      this.gameData.jackpot = jackpot;

      playerBetStatus.map((p) => {
        if (p.memberIndex == this.gameData.memberIndex) {
          // my bet
          this.gameData.myInfos.status = p.status;
          this.gameData.myInfos.statusList = p.statusList;
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
        const { playerStatus, currentPlayerIndex } = result;
        this.gameData.myInfos.status = playerStatus;
        this.gameData.currentPlayerIndex = currentPlayerIndex;
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
      
      if (preFoldPlayerIndex != this.gameData.memberIndex){
        let pIndex = this.gameData.otherPlayerList.findIndex(
          (obj) => obj.memberIndex == preFoldPlayerIndex
        );
        this.gameData.otherPlayerList[pIndex].status = "FOLDED";
      }
      this.gameData.currentPlayerIndex = currentPlayerIndex;
      this.gameData.myInfos.status = playerStatus;
    },

    OnMyUseCard(result) {
      // tableCards, handCards, jackpot, status, statusList
      const { tableCards, handCards, jackpot, status, fightersInfo, money } = result;
      this.gameData.tableCards = tableCards;
      // todo 
      // all player statusList can be changed
      if (!this.gameData.myInfos) {
        this.gameData.myInfos = { status };
      } else {
        this.gameData.myInfos.status = status;
        this.gameData.myInfos.money = money;
      }
      this.gameData.handCards = handCards.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
      this.gameData.jackpot = jackpot;
      this.gameData.fightersInfo = fightersInfo.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
    },

    OnOtherUseCard(result) {
      // useCardPlayerIndex,useCardPlayerHandCardsNumber,
      // jackpot,preUseCardFee,tableCards

      // todo 
      // all player statusList can be changed
      const {
        useCardPlayerIndex,
        useCardPlayerHandCardsNumber,
        useCardPlayerStatus,
        useCardPlayerMoney,
        jackpot,
        preUseCardFee,
        tableCards,
        fightersInfo
      } = result;
      this.gameData.jackpot = jackpot;
      this.gameData.preUseCardFee = preUseCardFee;
      this.gameData.tableCards = tableCards;
      let pIndex = this.gameData.otherPlayerList.findIndex(
        (obj) => obj.memberIndex == useCardPlayerIndex
      );
      this.gameData.otherPlayerList[pIndex].status = useCardPlayerStatus;
      this.gameData.otherPlayerList[pIndex].money = useCardPlayerMoney;
      this.gameData.otherPlayerList[pIndex].handCardsNum = useCardPlayerHandCardsNumber;
      this.gameData.fightersInfo = fightersInfo.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
    },

    OnEndUseCard(result) {
      // status currentPlayerIndex
      const { status, currentPlayerIndex } = result;
      this.gameData.currentPlayerIndex = currentPlayerIndex;
      if (currentPlayerIndex == this.gameData.memberIndex) {
        this.gameData.myInfos.status = status;
      } else {
        let pIndex = this.gameData.otherPlayerList.findIndex(
          (obj) => obj.memberIndex == currentPlayerIndex
        );
        this.gameData.otherPlayerList[pIndex].status = status;
        // todo 
        // all player statusList can be changed
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
        playerStatus,
        playerStatusList,
        currentRound,
        judgerCard,
        fightersInfo,
        tableCards,
        // preUseCardFee, preUseCardPlayerIndex, currentPlayerIndex,
        handCards,
        remainCardsNum,
        otherPlayerList,
        currentTableCardIndex
      } = result;
      this.gameData.jackpot = jackpot;
      this.gameData.status = status;
      this.gameData.currentRound = currentRound;
      this.gameData.judgerCard = judgerCard;
      this.gameData.myInfos.status = playerStatus;
      this.gameData.myInfos.statusList = playerStatusList;
      this.gameData.fightersInfo = fightersInfo.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
      this.gameData.tableCards = tableCards;
      this.gameData.currentTableCardIndex = currentTableCardIndex;
      this.gameData.handCards = handCards.sort(function (a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
      this.gameData.remainCardsNum = remainCardsNum;
      this.gameData.otherPlayerList = otherPlayerList;
    },

    GetWinnerFighter(result) {
      // winnerFighterId
      this.gameData.winnerFighterId = result.winnerFighterId;
      this.ShowWinnerFighterNotice(this.gameData.winnerFighterId, this.gameData.fightersInfo)
    },

    // eslint-disable-next-line
    OnOutHandCardsCheck(result){
      this.ShowOutHandCardsNotice();
    },

    OnGameEnd(result) {
      // rankList
      this.gameData.rankList = result.rankList;
      this.$msgbox({
        title: "本局排名",
        message: <RankList ref="RankList"/>,
        data: this.gameData.rankList
      })
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

    ShowWinnerFighterNotice(id, fighters){
      let idx = fighters.findIndex((obj => obj.id == id));
      let str = "角斗士ID:"+fighters[idx].id + "\n" +
                "角斗士名称:"+fighters[idx].name; 
      this.$alert(str, '获胜角斗士', {
          confirmButtonText: '确定'
        });
    },

    ShowOutHandCardsNotice(){
      this.$alert("手牌数已达上限，无法过牌", '提示', {
          confirmButtonText: '确定'
        });
    },

    ShowWinMoney(result){
      this.$alert(result.winMoney, '本轮获得', {
          confirmButtonText: '确定'
        });
    }

  },
};
</script>

<style>
  @import '../assets/styles/GameTable.css';
</style>