<template>
    <div class="app">
        <div class="table">
            <div class="top_area">
                <transition-group 
                    class="other_player_area" 
                    tag="div" 
                    :css="false" 
                    @enter="CustomMouseEnter"
                    @before-enter="CustomBeforeMouseEnter" 
                    @after-enter="CustomAfterMouseEnter"
                >
                    <OtherPlayerInfo 
                        v-for="(p, pIdx) in GameData.OtherPlayerList" 
                        :key="p.Index" 
                        :index="pIdx"
                        :TempCredit="p.TempCredit" 
                        :WinCredit="p.WinCredit" 
                        :PlayerIndex="p.Index"
                        :HandCardsNum="p.HandCardsNum" 
                        :Status="p.Status"
                    />
                </transition-group>

                <div class="room_info_area">
                    <RoomInfo 
                        :CurrentRound="GameData.CurrentRound" 
                        :RoundNumLimit="(GameConfig.RoundNumLimit || -1)"
                        :PublicJackpot="GameData.PublicJackpot" 
                        :CurrentStage="GameData.CurrentStage" 
                    />
                </div>
            </div>

            <div class="table_area">
                <div class="judger_card_area">
                    <JudgerCard 
                        :JudgerCard="GameData.JudgerCardInfo" 
                        :CurrentStage="GameData.CurrentStage" 
                    />
                </div>

                <transition-group 
                    class="fighter_list_area" 
                    tag="div" 
                    :css="false" 
                    @enter="CustomMouseEnter"
                    @before-enter="CustomBeforeMouseEnter" 
                    @after-enter="CustomAfterMouseEnter"
                >
                    <FighterCard 
                        v-for="f in GameData.FighterInfoList" 
                        :key="f.Id" 
                        :index="f.Id" 
                        :data-id="f.Id"
                        :PlayerStatus="GameData.MyInfos.Status" 
                        :GameCurrStage="GameData.CurrentStage"
                        :PlayerIndex="GameData.Index" 
                        :CurrentPlayerIndex="GameData.CurrentPlayerIndex"
                        :RoomNumber="GameData.RoomNumber" 
                        :FighterStatusList="GameData.FighterStatusList"
                        :PlayerTempCredit="GameData.MyInfos.TempCredit" 
                        :MinBetCredit="GameConfig.MinBetCredit" 
                        :MaxBetFighterCount="GameConfig.MaxBetFighterCount" 
                        :BetDetails="GameData.BetDetails"
                        :FighterBetDetails="GetFighterBetDetails(f.Id)" 
                        :Fighter="f" 
                    />
                </transition-group>

                <transition-group 
                    class="table_cards_area" 
                    tag="div" 
                    :css="false" 
                    @enter="CustomMouseEnter"
                    @before-enter="CustomBeforeMouseEnter" 
                    @after-enter="CustomAfterMouseEnter"
                >
                    <TableCard 
                        :key="card.k" 
                        :index="index" 
                        :data-id="index" 
                        :data="card"
                        :CurrentStage="GameData.CurrentStage" 
                        :CurrentTableCardIndex="GameData.CurrTableCardIndex"
                        :CardIndex="index" 
                        v-for="(card, index) in GameData.TableCardList" 
                    />
                </transition-group>
            </div>

            <div class="player_area">
                <div class="player_basic_info">
                    <PlayerBasicInfo
                        v-if="GameData.MyInfos"
                        :PlayerIndex="GameData.MyInfos.Index"
                        :Status="GameData.MyInfos.Status"
                        :TempCredit="GameData.MyInfos.TempCredit"
                        :WinCredit="GameData.MyInfos.WinCredit"
                        :CurrentStage="GameData.CurrentStage"
                        :BetDetails="GameData.BetDetails"
                        :RoomNumber="GameData.RoomNumber"
                        :CurrentPlayerIndex="GameData.CurrentPlayerIndex"
                        :CheckCardCost="(GameConfig.CheckCardCost || -1)"
                    />
                </div>

                <transition-group
                    class="player_hand_cards"
                    tag="div"
                    :css="false"
                    @enter="CustomMouseEnter"
                    @before-enter="CustomBeforeMouseEnter"
                    @after-enter="CustomAfterMouseEnter"
                >
                    <Card
                        v-for="(card, index) in GameData.HandCards"
                        :key="card.k"
                        :index="index"
                        :data="card"
                        @OnClientUseCardStart="OnClientUseCardStart"
                        :OnChooseHandCard="OnChooseHandCard"
                        :CurrentRoomStage="GameData.CurrentStage"
                        :PlayerStatus="GameData.MyInfos.Status"
                    />
                </transition-group>

                <div class="player_remain_cards_info">
                    <RemainCards :RemainCardsNum="GameData.RemainCardsNum" />
                </div>
            </div>

            <div class="match-dialog-container" v-show="IsShowSearchMatchDialog">
                正在匹配，请等待
            </div>

            <canvas id="animationCanvas" v-show="IsShowAnimCanvas" :width="WindoeWidth" :height="WindowHeight">
            </canvas>
        </div>
    </div>
</template>

<script>
import Velocity from "velocity-animate";

import OtherPlayerInfo from "../components/OtherPlayerInfo";
import RoomInfo from "../components/RoomInfo.vue";
import JudgerCard from "../components/JudgerCard.vue";
import FighterCard from "../components/FighterCard.vue";
import TableCard from "../components/TableCard.vue";
import PlayerBasicInfo from "../components/PlayerBasicInfo.vue";

export default {
    name: "GameTable",
    components: {
        OtherPlayerInfo,
        RoomInfo,
        JudgerCard,
        FighterCard,
        TableCard,
        PlayerBasicInfo
    },

    data() {
        return {
            // 前端展示设置
            IsShowSearchMatchDialog: false,
            IsShowAnimCanvas: false,
            WindoeWidth: 1920,
            WindowHeight: 1080,

            UserUid: new Date().getTime(),
            CurrChosenHandCardId: -1,

            GameConfig: {

            },
            GameData: {
                // 服务器数据
                Index: -1,
                RoomNumber: "-1",
                FighterStatusList: [],
                PublicJackpot: 0,
                CurrentStage: "",
                CurrentRound: 0,
                CurrentPlayerIndex: -1,
                JudgerCardInfo: null,
                WinFighterId: -1,
                CurrTableCardIndex: -1,
                RankList: [],
                BetDetails: [],
                FighterInfoList: [],
                TableCardList: [],
                HandCards: [],
                RemainCardsNum: -1,
                OtherPlayerList: [],
                MyInfos: null,
            }
        }
    },

    updated() {
        this.PlayerHandCardsAreaDom = document.querySelector(".player_hand_cards");
        this.OtherPlayerAreaDom = document.querySelector(".other_player_area");
        this.TableAreaDom = document.querySelector(".table_cards_area");
        this.FighterAreaDom = document.querySelector(".fighter_list_area");
    },

    mounted() {
        // this.sockets = io.connect("http://localhost:4001");
        this.$socket.open();

        // 注册API =============================================================
        // 连接到房间
        this.$socket.emit("COMMAND", {
            type: "CONNECT_TO_ROOM",
            UserUid: this.UserUid,
        });
        // 队列等待中
        this.sockets.subscribe("WAITE", () => {
            this.IsShowSearchMatchDialog = true;
        });
        // 重连到房间
        this.sockets.subscribe("RECONNECT_TO_ROOM", (result) => {
            this.GameData.RoomNumber = result.RoomNumber;
            this.GameData.Index = result.Index;
            this.GameConfig = result.RoomConfig;
        });
        this.sockets.subscribe("RESTORE_DATA", (result) => {
            this.RestoreGameData(result);
        });
        // 初始化游戏数据
        this.sockets.subscribe("INIT_GAME_DATA", (result) => {
            this.SetInitGameData(result);
        });
        // 更新卡牌效果生效后的游戏数据
        this.sockets.subscribe("ACTIVE_CARD_EFFECT", (result)=>{
           let TempData = this.$Tools.ActiveCardEffect(result);
           this.UpdateFullData(TempData);
        });
        // 接受下注后更新的数据
        this.sockets.subscribe("AFTER_BET_ON_FIGHTER", (result) => {
            this.AfterPlayerBetFighter(result);
        });
        // 玩家下注结束后更新状态及当前玩家index
        this.sockets.subscribe("AFTER_PLAYER_END_BET_FIGHTERS", (result) => {
            this.AfterPlayerEndBet(result);
        });
         // 玩家过牌后更新状态
         this.sockets.subscribe("AFTER_PLAYER_CHECK_CARD", (result) => {
            this.AfterPlayerCheckCard(result);
        });
        // 玩家弃牌后更新状态
        this.sockets.subscribe("AFTER_PLAYER_FOLD_CARD", (result) => {
            this.AfterPlayerFoldCard(result);
        });
        // 更新游戏阶段
        this.socket.subscribe("CHANGE_GAME_STAGE", (result)=>{
            this.OnChangeGameStage(result);
        });

        // 前端设置 =============================================================
        // 设置页面
        this.WindowWidth = window.innerWidth;
        this.WindowHeight = window.innerHeight;

        window.onresize = () => {
        this.WindowWidth = window.innerWidth;
        this.WindowHeight = window.innerHeight;
        };
        // 注册使用手牌的事件
        this.RegisterUseCardEvent();

    },

    methods: {
        // 重连到房间恢复数据
        RestoreGameData(result) {
            const {
                PublicJackpot, CurrentStage, FighterStatusList,
                CurrentRound, RoomConfig, CurrentPlayerIndex,
                JudgerCardInfo, FighterInfoList, TableCardList,
                HandCards, RemainCardsNum, MyInfos, OtherPlayerList
            } = result;
            this.GameData.PublicJackpot = PublicJackpot;
            this.GameData.CurrentStage = CurrentStage;
            this.GameData.FighterStatusList = FighterStatusList || [];
            this.GameData.CurrentRound = CurrentRound;
            this.GameData.CurrentPlayerIndex = CurrentPlayerIndex;
            this.GameData.JudgerCardInfo = JudgerCardInfo;
            this.GameData.FighterInfoList = FighterInfoList.sort(function (a, b) {
                return parseFloat(a.Id) - parseFloat(b.Id);
            });
            this.GameData.TableCardList = TableCardList;
            this.GameData.HandCards = HandCards;
            this.GameData.RemainCardsNum = RemainCardsNum;
            this.GameData.MyInfos = MyInfos;
            this.GameData.OtherPlayerList = OtherPlayerList;
            this.GameConfig = RoomConfig;
        },

        // 初始化游戏数据
        SetInitGameData(result) {
            const {
                PublicJackpot, CurrentStage, CurrentRound,
                RoomConfig, FighterStatusList, RoomNumber,
                CurrentPlayerIndex, JudgerCardInfo, FighterInfoList,
                TableCardList, HandCards, RemainCardsNum,
                MyInfos, OtherPlayerList
            } = result;
            this.GameData.PublicJackpot = PublicJackpot;
            this.GameData.CurrentStage = CurrentStage;
            this.GameData.FighterStatusList = FighterStatusList || [];
            this.GameData.RoomNumber = RoomNumber;
            this.GameData.CurrentRound = CurrentRound;
            this.GameData.CurrentPlayerIndex = CurrentPlayerIndex;
            this.GameData.JudgerCardInfo = JudgerCardInfo;
            this.GameData.FighterInfoList = FighterInfoList.sort(function (a, b) {
                return parseFloat(a.id) - parseFloat(b.id);
            });
            this.GameData.BetDetails = [];
            this.GameData.TableCardList = TableCardList;
            this.GameData.HandCards = HandCards;
            this.GameData.RemainCardsNum = RemainCardsNum;
            this.GameData.MyInfos = MyInfos;
            this.GameData.Index = MyInfos.Index;
            this.GameData.OtherPlayerList = OtherPlayerList;
            this.GameConfig = RoomConfig;
        },

        // 获取每个角斗士身上的下注信息
        GetFighterBetDetails(id) 
        {
            let res = [];
            this.GameData.FighterInfoList.map((f) => {
                if (f.Id == id) {
                    res = f.BetDetails;
                }
            });
            return res;
        },

        // 接受下注后更新的数据
        AfterPlayerBetFighter(res)
        {
            const {IsSuccess, ErrorMessage, BetPlayerIndex, Data} = res;
            if (IsSuccess)
            {
                let {PublicJackpot, BetDetails, FighterInfoList, BetPlayerInfo} = Data;
                this.GameData.PublicJackpot = PublicJackpot;
                this.GameData.FighterInfoList = FighterInfoList;
                this.GameData.BetDetails = BetDetails;
                if (BetPlayerIndex == this.GameData.Index)
                {
                    // 当前玩家下注成功
                    this.GameData.MyInfos.Status = BetPlayerInfo.Status;
                    this.GameData.MyInfos.TempCredit = BetPlayerInfo.TempCredit;
                }
                else
                {
                    // 其他玩家下注成功
                    let pIdxInOtherPL = this.GameData.OtherPlayerList.findIndex((p)=> p.Index == BetPlayerIndex);
                    if (pIdxInOtherPL != -1)
                    {
                        this.GameData.OtherPlayerList[pIdxInOtherPL].Status = BetPlayerInfo.Status;
                        this.GameData.OtherPlayerList[pIdxInOtherPL].TempCredit = BetPlayerInfo.TempCredit;
                    }
                }
            }
            else 
            {
                if (BetPlayerIndex == this.GameData.Index)
                {
                    // 下注失败 提示错误信息
                    this.$message({
                        showClose: false,
                        // TODO: erro message code to chinese
                        message: ErrorMessage,
                        type: 'error'
                    });
                }
            }
        },

        // 更新游戏阶段
        OnChangeGameStage(res)
        {
            const {CurrentStage} = res;
            this.GameData.CurrentStage = CurrentStage;
            if (CurrentStage == "CARD")
            {
                const {PlayerStatus, CurrentPlayerIndex} = res;
                this.GameData.MyInfos.Status = PlayerStatus;
                this.GameData.CurrentPlayerIndex = CurrentPlayerIndex;
            }
            else if (CurrentStage == "JUDGE")
            {
                const {PlayerStatus} = res;
                this.GameData.MyInfos.Status = PlayerStatus;
            }
            else if (CurrentStage == "CALC")
            {
                
            }
        },

        AfterPlayerEndBet(res)
        {
            const {PrevPlayerStatus, PrevPlayerIndex, CurrentPlayerIndex} = res;
            this.GameData.CurrentPlayerIndex = CurrentPlayerIndex
            if (PrevPlayerIndex == Index)
            {
                this.GameData.MyInfos.Status = PrevPlayerStatus;
            }
            else
            {
                const pIndex = this.GameData.OtherPlayerList.findIndex(
                    (obj) => obj.Index == p.PrevPlayerStatus
                );
                this.GameData.OtherPlayerList[pIndex].Status = PrevPlayerStatus;
            }
        },

        AfterPlayerCheckCard(res)
        {
            const {IsSuccess, ErrorMessage, Data} = res;
            if (IsSuccess)
            {
                if (Data.PrevPlayerIndex == this.GameData.Index)
                {
                    const {HandCards, RemainCardsNum, TempCredit, PublicJackpot, CurrentPlayerIndex} = Data;
                    this.GameData.HandCards = HandCards;
                    this.GameData.RemainCardsNum = RemainCardsNum;
                    this.GameData.PublicJackpot = PublicJackpot;
                    this.GameData.MyInfos.TempCredit = TempCredit;
                    this.GameData.CurrentPlayerIndex = CurrentPlayerIndex;
                }
                else
                {
                    const {PrevPlayerHandCardsNum, PrevPlayerTempCredit, PublicJackpot, CurrentPlayerIndex} = Data;
                    const pIdx = this.GameData.OtherPlayerList.findIndex(
                        (obj) => obj.Index == Data.PrevPlayerIndex
                    );
                    this.GameData.OtherPlayerList[pIdx].HandCardsNum = PrevPlayerHandCardsNum;
                    this.GameData.OtherPlayerList[pIdx].TempCredit = PrevPlayerTempCredit;
                    this.GameData.PublicJackpot = PublicJackpot;
                    this.GameData.CurrentPlayerIndex = CurrentPlayerIndex;
                }
            }
            else
            {
                // 过牌失败 显示错误信息
                this.$message({
                    showClose: false,
                    // TODO: erro message code to chinese
                    message: ErrorMessage,
                    type: 'error'
                });
            }
        },

        AfterPlayerFoldCard(res)
        {
            const {IsSuccess, ErrorMessage, Data} = res;
            if (IsSuccess)
            {
                const {CurrentPlayerIndex, PrevPlayerIndex, PrevPlayerStatus} = Data;

                if (PrevPlayerIndex == this.GameData.Index)
                {
                    this.GameData.MyInfos.Status = PrevPlayerStatus;
                }
                else
                {
                    const pIdx = this.GameData.OtherPlayerList.findIndex(
                        (obj) => obj.Index == PrevPlayerIndex
                    );
                    this.GameData.OtherPlayerList[pIdx].Status = PrevPlayerStatus;
                }
                this.GameData.CurrentPlayerIndex = CurrentPlayerIndex;
            }
            else
            {
                // 弃牌失败 显示错误信息
                this.$message({
                    showClose: false,
                    // TODO: erro message code to chinese
                    message: ErrorMessage,
                    type: 'error'
                });
            }
        },

        // tool functions 工具方法 ===========================
        // 鼠标挪入动画方法
        CustomBeforeMouseEnter(el) {
            el.style["transition"] = "all 0s";
            el.style.opacity = 0;
        },
        CustomMouseEnter(el, done) {
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
        CustomAfterMouseEnter(el) {
            el.style["transition"] = "all 0.2s";
            el.style.opacity = 1;
            el.style.transform = "";
        },

        // 鼠标选中手牌
        OnChooseHandCard(id) {
            this.CurrChosenHandCardId = id;
        },
        // 客户端拖拽使用卡牌
        OnClientUseCardStart({ startX, startY }) {
            this.IsShowAnimCanvas = true;
            this.useCardStartX = startX;
            this.useCardStartY = startY;
        },
        // 注册使用卡牌的事件
        RegisterUseCardEvent()
        {
            this.CanvasContext = document
                .querySelector("#animationCanvas")
                .getContext("2d");
            
            window.onmousemove = (e) => {
                if (window.IsNoTargetDrag)
                {
                    window.cardMoveX = e.pageX;
                    window.cardMoveY = e.pageY;
                }
                if (window.IsTargetDrag)
                {
                    window.requestAnimationFrame(() => {
                        // 绘制攻击箭头开始
                        this.CanvasContext.clearRect(0,0, this.WindoeWidth,this.WindowHeight);
                        this.CanvasContext.strokeStyle = "maroon";
                        this.CanvasContext.fillStyle = "maroon";

                        this.CanvasContext.save();
                        this.CanvasContext.setLineDash([40, 10]);
                        this.CanvasContext.lineWidth = 30;

                        this.CanvasContext.beginPath();
                        this.CanvasContext.moveTo(this.useCardStartX, this.useCardStartY);
                        this.CanvasContext.lineTo(e.pageX, e.pageY);
                        this.CanvasContext.fill();
                        this.CanvasContext.stroke();
                        this.CanvasContext.restore();

                        this.CanvasContext.save();
                        this.CanvasContext.beginPath();
                        this.CanvasContext.lineCap = "square";
                        this.CanvasContext.translate(e.pageX, e.pageY);
                        let getLineRadians = () => {
                            // 计算直线当前的角度
                            let _a = e.pageX - this.useCardStartX;
                            let _b = e.pageY - this.useCardStartY;
                            let _c = Math.hypot(_a, _b);
                            return Math.acos(_a / _c) * Math.sign(_b);
                        };
                        this.CanvasContext.rotate(getLineRadians() - Math.PI / 2);
                        this.CanvasContext.moveTo(35, -40);
                        this.CanvasContext.lineTo(0, 25);
                        this.CanvasContext.lineTo(-35, -40);
                        this.CanvasContext.lineTo(35, -40);
                        this.CanvasContext.fill();
                        this.CanvasContext.stroke();
                        this.CanvasContext.restore();
                        // 绘制攻击箭头结束
                    });
                }
            };

            window.onmouseup = (e) => {
                // 该手牌无需选择目标释放
                // 拖拽到Table Dom范围内即可使用
                if (window.IsNoTargetDrag && this.CurrChosenHandCardId !== -1) {
                window.IsNoTargetDrag = false;
                this.IsShowAnimCanvas = false;
                let top = this.TableAreaDom.offsetTop,
                    width = this.TableAreaDom.offsetWidth,
                    left = this.TableAreaDom.offsetLeft,
                    height = this.TableAreaDom.offsetHeight;

                let x = e.pageX,
                    y = e.pageY;

                if (x > left && x < left + width && y > top && y < top + height) {
                    // TODO
                    let bCanUseCard = true;
                    if (!bCanUseCard) {
                        // Can't use card
                        // this.$prompt("请输入本回合初次出牌金额", {
                        //     confirmButtonText: "确定",
                        //     cancelButtonText: "取消",
                        //     inputValidator: (value) => {
                        //     if (!new RegExp("^[0-9]*[1-9][0-9]*$").test(value)) {
                        //         return "必须是正整数";
                        //     }
                        //     if (value <= 0) {
                        //         return "出牌金额必须大于0";
                        //     } else if (value < this.gameData.preUseCardFee) {
                        //         return (
                        //         "上一次出牌金额为:" +
                        //         this.gameData.preUseCardFee +
                        //         ", 必须大于它"
                        //         );
                        //     }
                        //     },
                        // })
                        //     .then(async ({ value }) => {
                        //     this.$socket.emit("COMMAND", {
                        //         type: "USE_CARD",
                        //         roomNumber: this.gameData.roomNumber,
                        //         memberIndex: this.gameData.memberIndex,
                        //         cardId: this.currentChosenHandCardId,
                        //         useCardFee: parseInt(value),
                        //         needTarget: false,
                        //         targetType: "N/A",
                        //         targetId: -1,
                        //     });
                        //     })
                        //     .catch(() => {
                        //     this.$message({
                        //         type: "info",
                        //         message: "取消出牌",
                        //     });
                        //     });
                    } else {
                        // Can use card
                        // this.$socket.emit("COMMAND", {
                        //     type: "USE_CARD",
                        //     roomNumber: this.gameData.roomNumber,
                        //     memberIndex: this.gameData.memberIndex,
                        //     cardId: this.currentChosenHandCardId,
                        //     useCardFee: -1,
                        //     needTarget: false,
                        //     targetType: "N/A",
                        //     targetId: -1,
                        // });
                    }
                }

                window.cardMoveX = window.cardInitX;
                window.cardMoveY = window.cardInitY;
                }

                if (window.IsTargetDrag && this.CurrChosenHandCardId !== -1) {
                    window.IsTargetDrag = false;
                    this.IsShowAnimCanvas = false;
                    this.CanvasContext.clearRect(0, 0, this.WindoeWidth, this.WindowHeight);

                    // get current card need target
                    // check target type dom
                    // check if have target index

                    let x = e.pageX, // 鼠标松开的x
                        y = e.pageY, // 鼠标松开的y
                        k = -1; // 用于记录找到的卡牌的index

                    let targetAreaDom;
                    if (window.HandCardTargetType == "TABLE") {
                        targetAreaDom = this.TableAreaDom;
                    }
                    if (window.HandCardTargetType == "FIGHTER") {
                        targetAreaDom = this.FighterAreaDom;
                    }
                    if (window.HandCardTargetType == "OTHER_PLAYER") {
                        targetAreaDom = this.OtherPlayerAreaDom;
                    }
                    if (window.HandCardTargetType == "PLAYER") {
                        targetAreaDom = this.PlayerAreaDom;
                    }
                    if (window.HandCardTargetType == null) {
                        return;
                    }

                    let items = [...targetAreaDom.childNodes];

                    items.map((cd) => {
                        let top = cd.offsetTop,
                        width = cd.offsetWidth,
                        left = cd.offsetLeft,
                        height = cd.offsetHeight;

                        if (x > left && x < left + width && y > top && y < top + height) {
                            // TODO
                            let bCanUseCard = true;
                            if (!bCanUseCard) {
                                // TODO
                            } else {
                                k = cd.dataset.id;
                                // // console.log("use target card success");
                                // // console.log("card id:" , this.currentChosenHandCardId);
                                
                                // eslint-disable-next-line no-console
                                console.log("target id:" , k);

                                // let cI = this.gameData.handCards.findIndex(
                                // (obj) => obj.id == this.currentChosenHandCardId
                                // );
                                // this.$socket.emit("COMMAND", {
                                //     type: "USE_CARD",
                                //     roomNumber: this.gameData.roomNumber,
                                //     memberIndex: this.gameData.memberIndex,
                                //     cardId: this.currentChosenHandCardId,
                                //     useCardFee: -1,
                                //     needTarget: true,
                                //     targetType: this.gameData.handCards[cI].targetType,
                                //     targetId: k,
                                // });
                            }
                        }
                    });
                }
            };
        },
        // 卡牌特殊效果生效后更新全局数据
        UpdateFullData(Data)
        {
            const {
                PublicJackpot, CurrentStage, CurrentRound,
                RoomConfig, FighterStatusList, RoomNumber,
                CurrentPlayerIndex, JudgerCardInfo, FighterInfoList,
                TableCardList, HandCards, RemainCardsNum,
                MyInfos, OtherPlayerList, BetDetails
            } = Data;
            this.GameData.PublicJackpot = PublicJackpot;
            this.GameData.CurrentStage = CurrentStage;
            this.GameData.FighterStatusList = FighterStatusList;
            this.GameData.RoomNumber = RoomNumber;
            this.GameData.CurrentRound = CurrentRound;
            this.GameData.CurrentPlayerIndex = CurrentPlayerIndex;
            this.GameData.JudgerCardInfo = JudgerCardInfo;
            this.GameData.FighterInfoList = FighterInfoList.sort(function (a, b) {
                return parseFloat(a.id) - parseFloat(b.id);
            });
            this.GameData.BetDetails = BetDetails;
            this.GameData.TableCardList = TableCardList;
            this.GameData.HandCards = HandCards;
            this.GameData.RemainCardsNum = RemainCardsNum;
            this.GameData.MyInfos = MyInfos;
            this.GameData.Index = MyInfos.Index;
            this.GameData.OtherPlayerList = OtherPlayerList;
            this.GameConfig = RoomConfig;
        }
    },

}

</script>

<style>
@import '../assets/styles/GameTable.css';
</style>