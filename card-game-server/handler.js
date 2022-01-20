const {
    Cards,
    CardType,
    AttackType,
    AttackAnimationType,

    Fighters
} = require("./constants");

const { shuffle } = require("./utils");

const { ActiveCard } = require("./active_card");

const uuidv4 = require('uuid/v4');
const seedrandom = require("seedrandom");

const waitPairQueue = []; // 等待排序的队列
const memoryData = {}; // 缓存的房间游戏数据，key => 房间号，value => 游戏数据
const existUserGameRoomMap = {}; // 缓存用户的房间号， key => 用户标识，value => 房间号
const roomPlayerLimit = 3;
const roundNumLimit = 4;
const fighterNumLimit = 4;
const checkCardFee = 50;

// memoryData->value
// let v = { 
//     seed, // 随机数种子
//     rand: seedrandom(seed), // 随机方法
//     jackpot: 999,
//     status: "PREPARE / BET / CARD / JUDGE / CALC"
//     currentPlayerIndex: 0,
//     startPlayerIndex: 0,
//     currentRound: 1,
//     preUseCardFee: 0,
//     preUseCardPlayerIndex: 0,
//     judgerCard: {
//        // ... judger info
//     },
//     fateCard: {
//        // ... fate card info
//     }
//     fightersInfo: [{
//        id : 1,
//        // ...fighter info in constants
//         betInfos: [{
//             memberIndex: 1,
//             money: 999
//         }]
//     }],
//     tableCards: [{
//         // ... card info in constants
//     }],
//     usersList: [{
//         userId: 'xxx',
//         socket: socket,
//         roomNumber: "xxx",
//         memberIndex: 1,
//         money: 999,
//         status: "BETED / NOT_BETED / FOLDED/ NOT_FOLDED / PAID_USE_CARD"
//         betInfos: [{
//             fighterId: "xxx",
//             betMoney: 999
//         }],
//         handCards: [{
//             // ... card info in constants
//         }],
//         remainCards: [{
//             // ... card info in constants
//         }],
//     }],
// };


// CONNECT 连接到房间
// // INIT_FIGHTER_CARD 初始角斗士卡
// // INIT_JUDGER_CARD 初始裁判卡
// // INIT_HAND_CARD 给玩家发放初始手牌
// BET_ON_FIGHTER 玩家下注给角斗士
// // INIT_FATE_CARD 初始命运卡
// CHECK_CARD 过牌
// FOLD_CARD 弃牌
// USE_CARD 出牌
// END_USE_CARD 结束出牌
module.exports = function handleSynchronousClient(args, socket, socketServer) {
    switch (args.type) {
        case "CONNECT":
            Connect(args, socket, socketServer);
            break;
        case "ATTACK_CARD":
            attackCard(args, socket);
            break;
        case "OUT_CARD":
            outCard(args, socket);
            break;
        
        // todo
        case "BET_ON_FIGHTERS":
            OnBetFighters(args, socket);
            break;
        case "CHECK_CARD":
            OnCheckCard(args, socket);
            break;
        case "FOLD_CARD":
            OnFoldCard(args, socket);
            break;
        case "USE_CARD":
            OnUseCard(args, socket);
            break;
        case "END_USE_CARD":
            OnEndUseCard(args, socket);
            break;
    }
};

function Connect(args, socket, socketServer) {
    const {userId} = args;
    if (existUserGameRoomMap[userId]) { // 如果存在已经加入的对局，则直接进入之前的对战
        let roomNumber = existUserGameRoomMap[userId];
        
        let player = memoryData[roomNumber]["usersList"].map(v => v.userId === userId)[0];
        player.socket = socket;
        player.socket.emit("RECONNECT", {
            roomNumber: roomNumber,
            memberIndex: player.memberIndex
        });
        // 恢复牌桌数据
        RestoreGameData(roomNumber, userId)

        {
            // let identity = memoryData[roomNumber]["one"].userId === userId ? "one" : "two";
            // let identity = '';
            // if (userId == memoryData[roomNumber]["one"].userId) {
            //     identity = "one";
            // } else if (userId == memoryData[roomNumber]["two"].userId) {
            //     identity = "two";
            // } else if (userId == memoryData[roomNumber]["three"].userId) {
            //     identity = "three";
            // }
            // memoryData[roomNumber][identity].socket = socket;
            // memoryData[roomNumber][identity].socket.emit("RECONNECT", {
            //     roomNumber: roomNumber,
            //     memberId: identity
            // });

            // sendCards(roomNumber, identity); // 把牌发送给玩家
        }

    } else {
        socket.emit("WAITE"); // 不管三七二十一，先给老子等起

        if (waitPairQueue.length < roomPlayerLimit - 1) {
            waitPairQueue.push({
                userId, socket
            });
            socket.emit("WAITE");
        }
        else {
            let roomNumber = uuidv4(); // 生成房间号码
            let seed = Math.floor(Math.random() * 10000);

            memoryData[roomNumber] = {
                seed, // 随机数种子
                rand: seedrandom(seed), // 随机方法
            };
            let usersList = [];

            for (let i = 0; i < roomPlayerLimit - 1; i++) {
                let p = waitPairQueue.splice(0, 1)[0]; //随便拉个小伙干一架
                p.roomNumber = roomNumber;
                existUserGameRoomMap[p.userId] = roomNumber;
                p.socket.join(roomNumber);
                p.memberIndex = i;
                usersList.push(p);
            }

            existUserGameRoomMap[userId] = roomNumber;
            socket.join(roomNumber);
            usersList.push({
                userId, socket, roomNumber, memberIndex: roomPlayerLimit
            });

            memoryData[roomNumber]["usersList"] = usersList;

            memoryData[roomNumber]["usersList"].map(p => {
                p.socket.emit("START", {
                    roomNumber,
                    memberIndex: p.memberIndex
                });
            })
            
            InitGameData(roomNumber);
        }

        {
            // if (waitPairQueue.length < 2) {
            //     waitPairQueue.push({
            //         userId, socket
            //     });

            //     socket.emit("WAITE");
            // } else {
            //     let waitPlayer1 = waitPairQueue.splice(0, 1)[0]; // 随便拉个小伙干一架
            //     let waitPlayer2 = waitPairQueue.splice(0, 1)[0]; // 随便拉个小伙干一架
            //     let roomNumber = uuidv4(); // 生成房间号码

            //     let seed = Math.floor(Math.random() * 10000);

            //     // 初始化游戏数据
            //     waitPlayer1.roomNumber = roomNumber;
            //     memoryData[roomNumber] = {
            //         "one": waitPlayer1,
            //         "two": waitPlayer2,
            //         "three": {
            //             userId, socket, roomNumber
            //         },
            //         seed, // 随机数种子
            //         rand: seedrandom(seed), // 随机方法
            //     };
            //     existUserGameRoomMap[userId] = roomNumber;
            //     existUserGameRoomMap[waitPlayer1.userId] = roomNumber;
            //     existUserGameRoomMap[waitPlayer2.userId] = roomNumber;

            //     // 进入房间
            //     socket.join(roomNumber);
            //     waitPlayer.socket.join(roomNumber);

            //     // 游戏初始化完成，发送游戏初始化数据
            //     waitPlayer1.socket.emit("START", {
            //         roomNumber,
            //         memberId: "one"
            //     });
            //     waitPlayer2.socket.emit("START", {
            //         roomNumber,
            //         memberId: "two"
            //     });
            //     socket.emit("START", {
            //         roomNumber,
            //         memberId: "three"
            //     });
            //     initCard(roomNumber);
            // }
        }
    }
}

function InitGameData(roomNumber) {
    let random = memoryData[roomNumber].rand() * roomPlayerLimit % roomPlayerLimit;
    let gameData = {};
    gameData.currentPlayerIndex = random;
    gameData.startPlayerIndex = random;
    gameData.currentRound = 1;
    gameData.jackpot = 0;
    // gameData.status = "PREPARE";
    gameData.status = "BET";

    // generate fighters
    let tmpFighters = [...Fighters];
    let initFighters = [];
    for (var i = 0; i < fighterNumLimit; i++) {
        var ran = Math.floor(Math.random() * arr.length);
        let t = tmpFighters.splice(ran, 1)[0];
        Object.assign(t, {
            betInfos: []
        })
        initFighters.push(t);
    };
    gameData.fightersInfo = initFighters;
    gameData.preUseCardFee = 0;
    gameData.preUseCardPlayerIndex = 0;

    // add judger card
    // todo

    // empty table cards
    gameData.tableCards = [];

    // add usersinfo
    gameData.usersList = memoryData[roomNumber]["usersList"];
    gameData.usersList.map(u => {
        u.money = 5000;
        u.status = "NOT_BETED";
        u.betInfos = [];

        // get hand cards;
        u.handCards = [];
        u.remainCards = shuffle(memoryData[roomNumber].rand, Cards.map((c, index) => Object.assign({ k: index }, c)));
        for (var i = 0; i < 3; i++){
            var t = GetNextCard(u.remainCards)
            if (t !== null) {
                u.handCards.push(t);
            }
        }
    });

    memoryData[roomNumber] = gameData;
    SendInitDataToAll(roomNumber);
}

function GetNextCard(remainCards) {
    if (remainCards.length > 0) {
        return remainCards.splice(0, 1)[0]
    } else {
        return null
    }
}

function GetNextPlayerIndex(currIndex, usersList, roomPlayerLimit) {
    let tmpIndex = currIndex, times = 0;
    while (usersList[tmpIndex].status == "FOLDED" && times < roomPlayerLimit) {
        tmpIndex = tmpIndex + 1 % roomPlayerLimit;
        times++;
    }
    return tmpIndex;
}

function SendInitDataToAll(roomNumber) {
    const { seed, rand, jackpot, status, currentRound, currentPlayerIndex, fightersInfo,
        preUseCardFee, preUseCardPlayerIndex,
        tableCards,
        usersList } = memoryData[roomNumber];
    usersList.map((u) => {
        let currentPlayerHandCards = usersList.map(p => p.userId == u.userId).handCards;
        let currentPlayerRemainCardsNum = usersList.map(p => p.userId == u.userId).remainCards.length;
        let otherPlayerList = [];
        usersList.map(p => p.userId !== u.userId).map(o => {
            otherPlayerList.push({
                money: o.money,
                handCardsNum: o.handCards.length
            })
        })
        // todo
        // add judger info
        u.socket.emit("INIT_DATA", {
            seed, rand, jackpot, status, currentRound, currentPlayerIndex, fightersInfo, tableCards,
            preUseCardFee, preUseCardPlayerIndex,
            handCards: currentPlayerHandCards,
            remainCardsNum: currentPlayerRemainCardsNum,
            otherPlayerList
        })
    });
}

function RestoreGameData(roomNumber, userId) {
    const { seed, rand, jackpot, status, currentRound, currentPlayerIndex, fightersInfo,
        preUseCardFee, preUseCardPlayerIndex,
        tableCards,
        usersList } = memoryData[roomNumber];
    let player = memoryData[roomNumber]["usersList"].map(v => v.userId === userId)[0];

    let otherPlayerList = [];
    usersList.map(p => p.userId !== u.userId).map(o => {
        otherPlayerList.push({
            money: o.money,
            handCardsNum: o.handCards.length
        })
    });
    
    // todo
    // add restore judger and fate card
    player.socket.emit("RESTORE_DATA", {
        seed, rand, jackpot, status, currentRound, currentPlayerIndex, fightersInfo, tableCards,
        preUseCardFee, preUseCardPlayerIndex,
        handCards: player.handCards,
        remainCardsNum: player.remainCards.length,
        otherPlayerList,
    });
}

function OnBetFighters(args, socket) {
    let roomNumber = args.roomNumber, betList = args.betList, memberIndex = args.memberIndex;

    // change memory data
    let currUserIndex = memoryData[roomNumber][usersList].findIndex((obj => obj.memberIndex == memberIndex));
    memoryData[roomNumber][usersList][currUserIndex].betInfos = betList;
    memoryData[roomNumber][usersList][currUserIndex].status = "BETED";
    let usedMoney = 0;
    betList.map(b => {
        let id = b.fighterId, money = b.betMoney;
        let fighterIndex = memoryData[roomNumber].fightersInfo.findIndex((obj => obj.id == id));
        memoryData[roomNumber]["fightersInfo"][fighterIndex].betInfos.push({
            memberIndex,
            money
        });
        usedMoney += money;
    })
    memoryData[roomNumber][usersList][currUserIndex].money -= usedMoney;
    memoryData[roomNumber].currentPlayerIndex = memoryData[roomNumber].currentPlayerIndex + 1 % roomPlayerLimit;

    // send change to user
    memoryData[roomNumber][usersList].map(p => {
        p.socket.emit("AFTER_BET_DATA", {
            fightersInfo: memoryData[roomNumber]["fightersInfo"],
            playerBetStatus: memoryData[roomNumber][usersList].map(o => {
                return {
                    status: o.status,
                    memberIndex: o.memberIndex,
                    userId: o.userId,
                    money: o.money,
                    currentPlayerIndex: memoryData[roomNumber].currentPlayerIndex
                }
            })
        })
    })

    // if all beted , get fate card and go to "CARD" stage
    let betFlag = 0;
    memoryData[roomNumber][usersList].map(o => {
        if (o.status === "BETED") {
            betFlag += 1;
        }
    })
    if (betFlag == roomPlayerLimit) {
        GetFateCard(roomNumber);
        memoryData[roomNumber].status = "CARD";
        memoryData[roomNumber][usersList].map(p => {
            p.socket.emit("CHANGE_ROOM_STAGE", {
                status: "CARD"
                // todo
                // add fate card
            })
        })
    }
}

function OnCheckCard(args, socket) {
    let roomNumber = args.roomNumber, memberIndex = args.memberIndex;
    
    // todo 
    // 操作的合法性判断
    
    let currUserIndex = memoryData[roomNumber][usersList].findIndex((obj => obj.memberIndex == memberIndex));
    memoryData[roomNumber][usersList][currUserIndex].money -= checkCardFee;
    memoryData[roomNumber].jackpot += checkCardFee;
    //memoryData[roomNumber].currentPlayerIndex = memoryData[roomNumber].currentPlayerIndex + 1 % roomPlayerLimit;
    memoryData[roomNumber].currentPlayerIndex = GetNextPlayerIndex(
        memoryData[roomNumber].currentPlayerIndex,
        memoryData[roomNumber].usersList,
        roomPlayerLimit
    );
    var t = GetNextCard(memoryData[roomNumber][usersList][currUserIndex].remainCards)
    if (t !== null) {
        memoryData[roomNumber][usersList][currUserIndex].handCards.push(t);
    }

    // check card player get new hand card info, remain card number , new money, jackpot money, next player index
    socket.emit("MY_CHECK_CARD", {
        handCards: memoryData[roomNumber][usersList][currUserIndex].handCards,
        remainCardsNum: memoryData[roomNumber][usersList][currUserIndex].remainCards.length,
        money: memoryData[roomNumber][usersList][currUserIndex].money,
        jackpot: memoryData[roomNumber].jackpot,
        currentPlayerIndex: memoryData[roomNumber].currentPlayerIndex
    })
    // other players get new money, hand cards number, jackpot money, next player index
    memoryData[roomNumber][usersList].map(p => {
        if (p.memberIndex !== memberIndex) {
            p.socket.emit("OTHER_CHECK_CARD", {
                jackpot: memoryData[roomNumber].jackpot,
                prePlayerIndex: currUserIndex,
                money: memoryData[roomNumber][usersList][currUserIndex].money,
                handCardsNum: memoryData[roomNumber][usersList][currUserIndex].handCards.length,
                currentPlayerIndex: memoryData[roomNumber].currentPlayerIndex
            })
        }
    })
}

function OnFoldCard(args, socket) {
    let roomNumber = args.roomNumber, memberIndex = args.memberIndex;

    let currUserIndex = memoryData[roomNumber][usersList].findIndex((obj => obj.memberIndex == memberIndex));
    memoryData[roomNumber][usersList][currUserIndex].status = "FOLDED";
    memoryData[roomNumber].currentPlayerIndex = GetNextPlayerIndex(
        memoryData[roomNumber].currentPlayerIndex,
        memoryData[roomNumber].usersList,
        roomPlayerLimit
    );

    // if all folded -> to judge stage
    let foldedPlayerNum = 0;
    memoryData[roomNumber][usersList].map(p => {
        if (p.status == "FOLDED") {
            foldedPlayerNum++;
        }
    });
    if (foldedPlayerNum == roomPlayerLimit) {
        memoryData[roomNumber].status = "JUDGE";
        memoryData[roomNumber][usersList].map(p => {
            p.socket.emit("CHANGE_ROOM_STAGE", {
                status: "JUDGE"
            })
        })
        JudgeTableCards(roomNumber);
    }
    // next player
    else {
        memoryData[roomNumber][usersList].map(p => {
            p.socket.emit("FOLD_CARD", {
                preFoldPlayerIndex: memberIndex,
                currentPlayerIndex: memoryData[roomNumber].currentPlayerIndex
            })
        })
    }
}

function OnUseCard(args, socket) {
    let { roomNumber, memberIndex, cardId, useCardFee } = args;
    // let preUseCardFee = memoryData[roomNumber].preUseCardFee;
    let currUserIndex = memoryData[roomNumber][usersList].findIndex((obj => obj.memberIndex == memberIndex));

    // first use card
    if (memoryData[roomNumber][usersList][currUserIndex].status !== "PAID_USE_CARD") {

        memoryData[roomNumber][usersList][currUserIndex].status = "PAID_USE_CARD";
        memoryData[roomNumber][usersList][currUserIndex].money -= useCardFee;
        memoryData[roomNumber].jackpot += useCardFee;
        memoryData[roomNumber].preUseCardFee = useCardFee;

    } 

    // remove card from hand card, add to table cards
    let cardIndexInHandCards = memoryData[roomNumber][usersList][currUserIndex].handCards.findIndex((obj => obj.id == cardId));
    let card = memoryData[roomNumber][usersList][currUserIndex].handCards.splice(cardIndexInHandCards, 1)[0];
    if (card !== null) {
        memoryData[roomNumber].tableCards.push(card);
        //active card
        ActiveCard(card, memoryData[roomNumber]);
    }

    // send table cards, hand cards, jackpot, status to curr player
    socket.emit("MY_USE_CARD", {
        tableCards: memoryData[roomNumber].tableCards,
        handCards: memoryData[roomNumber][usersList][currUserIndex].handCards,
        jackpot: memoryData[roomNumber].jackpot,
        status: memoryData[roomNumber][usersList][currUserIndex].status
    })

    // send table cards, hand cards number of curr_player, jackpot, preUseCardFee to other player
    memoryData[roomNumber][usersList].map(p => {
        if (p.memberIndex !== memberIndex) {
            p.socket.emit("OTHER_USE_CARD", {
                useCardPlayerIndex: memberIndex,
                useCardPlayerHandCardsNumber: memoryData[roomNumber][usersList][currUserIndex].handCards.length,
                jackpot: memoryData[roomNumber].jackpot,
                preUseCardFee: memoryData[roomNumber].preUseCardFee,
                tableCards: memoryData[roomNumber].tableCards,
            });
        }
    })
}

function OnEndUseCard(args, socket) {
    let { roomNumber, memberIndex, } = args;
    
    let currUserIndex = memoryData[roomNumber][usersList].findIndex((obj => obj.memberIndex == memberIndex));
    memoryData[roomNumber][usersList][currUserIndex].status = "NOT_FOLDED";
    memoryData[roomNumber].currentPlayerIndex = GetNextPlayerIndex(
        memoryData[roomNumber].currentPlayerIndex,
        memoryData[roomNumber].usersList,
        roomPlayerLimit
    );

    memoryData[roomNumber].usersList.map(p => {
        p.socket.emit("END_USE_CARD", {
            currentPlayerIndex: memoryData[roomNumber].currentPlayerIndex
        });
    });

}

function JudgeTableCards(roomNumber) {
    // set fighters info to initial and send to players
    memoryData[roomNumber].fightersInfo.map(f => {
        f.health = f.healthBase;
        f.magic = f.magicBase;
    });
    memoryData[roomNumber].usersList.map("JUDGE_INIT_FIGHTERS", {
        fightersInfo: memoryData[roomNumber].fightersInfo
    });

    // active card
    memoryData[roomNumber].tableCards.map(card => {
        ActiveCard(card, memoryData[roomNumber]);
        memoryData[roomNumber].usersList.map(p => {

            let currentPlayerHandCards = p.handCards;
            let currentPlayerRemainCardsNum = p.remainCards.length;
            let otherPlayerList = [];
            usersList.map(p => p.userId !== u.userId).map(o => {
                otherPlayerList.push({
                    money: o.money,
                    handCardsNum: o.handCards.length
                })
            })

            // todo
            // add judger and fate card info
            p.socket.emit("JUDGE_ACTIVE_CARD", {
                seed, rand, jackpot, status: p.status,
                currentRound, currentPlayerIndex,
                fightersInfo,
                tableCards,
                preUseCardFee, preUseCardPlayerIndex,
                handCards: currentPlayerHandCards,
                remainCardsNum: currentPlayerRemainCardsNum,
                otherPlayerList
            })

        })
    })

    // todo
    // change to CALC stage
}

function attackCard(args, socket) {
    let roomNumber = args.r, myK = args.myK, attackK = args.attackK, card, attackCard;

    if (!memoryData[roomNumber]) {
        return
    }

    let belong = memoryData[roomNumber]["one"].socket.id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = memoryData[roomNumber]["one"].socket.id !== socket.id ? "one" : "two";

    let index = memoryData[roomNumber][belong]["tableCards"].findIndex(c => c.k === myK);
    let attackIndex = memoryData[roomNumber][other]["tableCards"].findIndex(c => c.k === attackK);

    if (index !== -1 && attackIndex !== -1
        && memoryData[roomNumber][belong]["tableCards"].length > index
        && memoryData[roomNumber][other]["tableCards"].length > attackIndex) {
        card = memoryData[roomNumber][belong]["tableCards"][index];
        attackCard = memoryData[roomNumber][other]["tableCards"][attackIndex];

        // 奉献处理
        let hasDedication = memoryData[roomNumber][other]["tableCards"].some(c => c.isDedication);

        if (attackCard.isDedication || !hasDedication) {
            // 符合奉献的条件
            if (attackCard.isStrong) { // 强壮
                attackCard.isStrong = false;
            } else {
                attackCard.life -= card.attack;
            }

            if (card.isStrong) { // 强壮
                card.isStrong = false;
            } else {
                card.life -= attackCard.attack;
            }

            if (card.onAttack) {
                card.onAttack({
                    myGameData: memoryData[roomNumber][belong],
                    otherGameData: memoryData[roomNumber][other],
                    thisCard: card,
                    beAttackCard: attackCard,
                })
            }

            if (attackCard.onBeAttacked) {
                attackCard.onBeAttacked({
                    myGameData: memoryData[roomNumber][other],
                    otherGameData: memoryData[roomNumber][belong],
                    thisCard: attackCard,
                    beAttackCard: card,
                })
            }

            memoryData[roomNumber][belong].socket.emit("ATTACK_CARD", {
                index,
                attackIndex,
                attackType: AttackType.ATTACK,
                animationType: AttackAnimationType.NORMAL,
                card,
                attackCard
            });

            memoryData[roomNumber][other].socket.emit("ATTACK_CARD", {
                index,
                attackIndex,
                attackType: AttackType.BE_ATTACKED,
                animationType: AttackAnimationType.NORMAL,
                card,
                attackCard
            });

            checkCardDieEvent(roomNumber);
        } else {
            // error 您必须攻击带有奉献的单位
        }
    }

}

function outCard(args, socket) {
    let roomNumber = args.r, index = args.index, card;

    if (!memoryData[roomNumber]) {
        return
    }

    let belong = memoryData[roomNumber]["one"].socket.id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = memoryData[roomNumber]["one"].socket.id !== socket.id ? "one" : "two";

    // 判断费用和位置是否已经满了
    if (index !== -1 && memoryData[roomNumber][belong]['cards'][index].cost <= memoryData[roomNumber][belong]["fee"]) {
        card = memoryData[roomNumber][belong]["cards"].splice(index, 1)[0];
        if (card.cardType === CardType.CHARACTER && memoryData[roomNumber][belong]["tableCards"].length >= 10) {
            // error 场上怪物满了
            return;
        }

        memoryData[roomNumber][belong]["fee"] -= card.cost;

        memoryData[roomNumber][belong]["tableCards"].push(card);
        memoryData[roomNumber][belong].socket.emit("OUT_CARD", {
            index,
            card,
            isMine: true
        });
        memoryData[roomNumber][other].socket.emit("OUT_CARD", {
            index,
            card,
            isMine: false
        });

        let mySpecialMethod = getSpecialMethod(belong, roomNumber);
        if (card && card.onStart) {
            card.onStart({
                myGameData: memoryData[roomNumber][belong],
                otherGameData: memoryData[roomNumber][other],
                thisCard: card,
                specialMethod: mySpecialMethod
            })
        }

        checkCardDieEvent(roomNumber);
    } else {
        // error 费用不足
    }
}


function checkCardDieEvent(roomNumber, level, myKList, otherKList) {
    if (!level) {
        level = 1;
        myKList = [];
        otherKList = [];
    }

    if (memoryData[roomNumber]["one"]["tableCards"].some(c => c.life <= 0) || memoryData[roomNumber]["two"]["tableCards"].some(c => c.life <= 0)) {
        let oneSpecialMethod = getSpecialMethod("one", roomNumber),
            twoSpecialMethod = getSpecialMethod("two", roomNumber);

        for (let i = memoryData[roomNumber]["one"]["tableCards"].length - 1; i >= 0; i--) {
            let c = memoryData[roomNumber]["one"]["tableCards"][i];

            if (c.life <= 0) {
                if (c.onEnd) { // 亡语
                    c.onEnd({
                        myGameData: memoryData[roomNumber]["one"],
                        otherGameData: memoryData[roomNumber]["two"],
                        thisCard: card,
                        specialMethod: oneSpecialMethod
                    })
                }
                myKList.push(c.k);
                memoryData[roomNumber]["one"]["tableCards"].splice(i, 1);
            }
        }

        for (let i = memoryData[roomNumber]["two"]["tableCards"].length - 1; i >= 0; i--) {
            let c = memoryData[roomNumber]["two"]["tableCards"][i];

            if (c.life <= 0) {
                if (c.onEnd) { // 亡语
                    c.onEnd({
                        myGameData: memoryData[roomNumber]["two"],
                        otherGameData: memoryData[roomNumber]["one"],
                        thisCard: card,
                        specialMethod: twoSpecialMethod
                    })
                }
                otherKList.push(c.k);
                memoryData[roomNumber]["two"]["tableCards"].splice(i, 1);
            }
        }

        checkCardDieEvent(roomNumber, level + 1, myKList, otherKList);
    }

    if (level === 1 && (myKList.length !== 0 || otherKList.length !== 0)) {
        getSpecialMethod("one", roomNumber).dieCardAnimation(true, myKList, otherKList);
    }
}

function getSpecialMethod(identity, roomNumber) {
    let otherIdentity = identity === "one" ? "two": "one";

    return {
        dieCardAnimation(isMine, myKList, otherKList) {
            memoryData[roomNumber][identity].socket.emit("DIE_CARD", {
                isMine,
                myKList,
                otherKList
            });

            memoryData[roomNumber][otherIdentity].socket.emit("DIE_CARD", {
                isMine: !isMine,
                myKList,
                otherKList
            });
        }
    }
}