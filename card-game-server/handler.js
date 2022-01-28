const {
  Cards,
  CardType,
  AttackType,
  AttackAnimationType,

  Fighters,
  Judgers,
  FateCards
} = require("./constants");

const { shuffle } = require("./utils");

const { ActiveCard } = require("./active_card");

const uuidv4 = require('uuid/v4');
const seedrandom = require("seedrandom");

const waitPairQueue = []; // 等待排序的队列
const memoryData = {}; // 缓存的房间游戏数据，key => 房间号，value => 游戏数据
const existUserGameRoomMap = {}; // 缓存用户的房间号， key => 用户标识，value => 房间号
const roomPlayerLimit = 1;
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
//         fighterId: 1
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

    // case "ATTACK_CARD":
    //     attackCard(args, socket);
    //     break;
    // case "OUT_CARD":
    //     outCard(args, socket);
    //     break;

    // todo
    case "BET_ON_FIGHTERS":
      OnBetFighters(args, socket);
      break;
    case "END_BET_FIGHTERS":
      OnEndBetFighters(args, socket);
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
  const { userId } = args;
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
        p.status = "NOT_BETED";
        usersList.push(p);
      }

      existUserGameRoomMap[userId] = roomNumber;
      socket.join(roomNumber);
      usersList.push({
        userId, socket, roomNumber, memberIndex: roomPlayerLimit,
        status: "NOT_BETED",
      });

      memoryData[roomNumber]["usersList"] = usersList;

      memoryData[roomNumber]["usersList"].map(p => {
        p.socket.emit("START", {
          roomNumber,
          memberIndex: p.memberIndex,
        });
      })

      InitGameData(roomNumber);
    }
  }
}

function InitGameData(roomNumber) {
  // let random = memoryData[roomNumber].rand() * (roomPlayerLimit - 1) % (roomPlayerLimit - 1);
  let random = memoryData[roomNumber].rand() * roomPlayerLimit;
  random = Math.floor(random);
  let gameData = {};
  gameData.seed = memoryData[roomNumber].seed;
  gameData.rand = memoryData[roomNumber].rand;
  gameData.currentPlayerIndex = memoryData[roomNumber]["usersList"][random].memberIndex;
  gameData.startPlayerIndex = memoryData[roomNumber]["usersList"][random].memberIndex;
  gameData.currentRound = 1;
  gameData.jackpot = 0;
  // gameData.status = "PREPARE";
  gameData.status = "BET";

  // generate fighters
  let tmpFighters = [...Fighters];
  let initFighters = [];
  for (var i = 0; i < fighterNumLimit; i++) {
    var ran = Math.floor(Math.random() * tmpFighters.length);
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
  let tmpJudgers = [...Judgers];
  var ranJudgerIndex = Math.floor(Math.random() * tmpJudgers.length);
  gameData.judgerCard = tmpJudgers.splice(ranJudgerIndex, 1)[0];

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
    for (var i = 0; i < 3; i++) {
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

function GetFateCard(roomNumber) {
  // let fateIndex = Math.round(memoryData[roomNumber].rand() * (FateCards.length - 1)) % (FateCards.length - 1);
  let fateIndex = Math.round(memoryData[roomNumber].rand() * (FateCards.length - 1));

  memoryData[roomNumber].fateCard = FateCards[fateIndex];
  return memoryData[roomNumber].fateCard;
}

function GetNextPlayerIndex(currIndex, usersList, roomPlayerLimit) {
  let times = 0;
  let pIndex = usersList.findIndex(obj => obj.memberIndex == currIndex);
  while (usersList[pIndex].status == "FOLDED" && times < roomPlayerLimit) {
    pIndex = pIndex + 1 % (roomPlayerLimit);
    times++;
  }
  return usersList[pIndex].memberIndex;;
}

function SendInitDataToAll(roomNumber) {
  const { seed, rand, jackpot, status, currentRound, currentPlayerIndex,
    judgerCard, fightersInfo,
    preUseCardFee, preUseCardPlayerIndex,
    tableCards,
    usersList } = memoryData[roomNumber];
  usersList.map((u) => {
    let cIndex = usersList.findIndex(obj => obj.userId == u.userId);
    let currentPlayerHandCards = usersList[cIndex].handCards;
    let currentPlayerRemainCardsNum = usersList[cIndex].remainCards.length;
    let currPlayerMoney = usersList[cIndex].money;
    let currPlayerStatus = usersList[cIndex].status;
    let currPlayerMemberIndex = usersList[cIndex].memberIndex;
    let otherPlayerList = [];
    usersList.map(p => {
      if (p.userId !== u.userId) {
        otherPlayerList.push({
          money: p.money,
          memberIndex: p.memberIndex,
          handCardsNum: p.handCards.length,
          status: p.status
        })
      }
    });
    u.socket.emit("INIT_DATA", {
      seed, rand, jackpot, status, currentRound, roundNumLimit, checkCardFee,
      roomNumber,
      currentPlayerIndex,
      judgerCard, fightersInfo,
      tableCards,
      preUseCardFee, preUseCardPlayerIndex,
      handCards: currentPlayerHandCards,
      remainCardsNum: currentPlayerRemainCardsNum,
      myInfos: {
        money: currPlayerMoney,
        status: currPlayerStatus,
        memberIndex: currPlayerMemberIndex,
      },
      otherPlayerList
    })
  });
}

function RestoreGameData(roomNumber, userId) {
  const { seed, rand, jackpot, status, currentRound, currentPlayerIndex,
    judgerCard, fateCard, fightersInfo,
    preUseCardFee, preUseCardPlayerIndex,
    tableCards,
    usersList } = memoryData[roomNumber];
  let player = memoryData[roomNumber]["usersList"].map(v => v.userId === userId)[0];

  let otherPlayerList = [];
  usersList.map(p => p.userId !== u.userId).map(o => {
    otherPlayerList.push({
      money: o.money,
      handCardsNum: o.handCards.length,
      memberIndex: o.memberIndex,
      status: o.status
    })
  });

  player.socket.emit("RESTORE_DATA", {
    seed, rand, jackpot, status, currentRound, roundNumLimit, checkCardFee,
    currentPlayerIndex,
    judgerCard, fateCard, fightersInfo,
    tableCards,
    preUseCardFee, preUseCardPlayerIndex,
    handCards: player.handCards,
    remainCardsNum: player.remainCards.length,
    myInfos: {
      money: player.money,
      status: player.status,
      memberIndex: player.memberIndex,
    },
    otherPlayerList,
  });
}

function OnEndBetFighters(args, socket) {
  let { roomNumber, memberIndex } = args;
  let currUserIndex = memoryData[roomNumber]["usersList"].findIndex((obj => obj.memberIndex == memberIndex));
  memoryData[roomNumber]["usersList"][currUserIndex].status = "BETED";
  memoryData[roomNumber].currentPlayerIndex =
    memoryData[roomNumber]["usersList"][(memoryData[roomNumber].currentPlayerIndex + 1) % roomPlayerLimit].memberIndex;

  // send change to user
  memoryData[roomNumber]["usersList"].map(p => {
    p.socket.emit("AFTER_BET_DATA", {
      fightersInfo: memoryData[roomNumber]["fightersInfo"],
      playerBetStatus: memoryData[roomNumber]["usersList"].map(o => {
        return {
          status: o.status,
          memberIndex: o.memberIndex,
          userId: o.userId,
          money: o.money,
          betInfos: o.betInfos,
          currentPlayerIndex: memoryData[roomNumber].currentPlayerIndex
        }
      })
    })
  })

  // if all beted , get fate card and go to "CARD" stage
  let betFlag = 0;
  memoryData[roomNumber]["usersList"].map(o => {
    if (o.status === "BETED") {
      betFlag += 1;
    }
  })
  if (betFlag == roomPlayerLimit) {
    memoryData[roomNumber].fateCard = GetFateCard(roomNumber);
    memoryData[roomNumber].status = "CARD";
    memoryData[roomNumber]["usersList"].map(p => {
      p.status = "NOT_FOLDED";
      p.socket.emit("CHANGE_ROOM_STAGE", {
        status: "CARD",
        playerStatus: "NOT_FOLDED",
        fateCard: memoryData[roomNumber].fateCard
      })
    })
  }
}

function OnBetFighters(args, socket) {
  // let roomNumber = args.roomNumber, fighterId = args.fighterId, memberIndex = args.memberIndex;
  let { roomNumber, fighterId, memberIndex, betMoney } = args;

  // change memory data
  let currUserIndex = memoryData[roomNumber]["usersList"].findIndex((obj => obj.memberIndex == memberIndex));
  if (memoryData[roomNumber]["usersList"][currUserIndex].betInfos.length == 3) {
    return;
  }
  memoryData[roomNumber]["usersList"][currUserIndex].betInfos.push({
    fighterId, betMoney
  });
  if (memoryData[roomNumber]["usersList"][currUserIndex].betInfos.length == 3) {
    memoryData[roomNumber]["usersList"][currUserIndex].status = "BETED";
  }
  let fighterIndex = memoryData[roomNumber].fightersInfo.findIndex((obj => obj.id == fighterId));
  memoryData[roomNumber]["fightersInfo"][fighterIndex].betInfos.push({
    memberIndex,
    money: betMoney
  });

  memoryData[roomNumber]["usersList"][currUserIndex].money -= betMoney;
  // memoryData[roomNumber].currentPlayerIndex = (memoryData[roomNumber].currentPlayerIndex + 1) % roomPlayerLimit;

  // send change to user
  memoryData[roomNumber]["usersList"].map(p => {
    p.socket.emit("AFTER_BET_DATA", {
      fightersInfo: memoryData[roomNumber]["fightersInfo"],
      playerBetStatus: memoryData[roomNumber]["usersList"].map(o => {
        return {
          status: o.status,
          memberIndex: o.memberIndex,
          userId: o.userId,
          money: o.money,
          betInfos: o.betInfos,
          currentPlayerIndex: memoryData[roomNumber].currentPlayerIndex
        }
      })
    })
    if (p.memberIndex == memberIndex) {
      p.socket.emit("ALREADY_BET_ONCE", {

      });
    }
  })

  // if all beted , get fate card and go to "CARD" stage
  let betFlag = 0;
  memoryData[roomNumber]["usersList"].map(o => {
    if (o.status === "BETED") {
      betFlag += 1;
    }
  })
  if (betFlag == roomPlayerLimit) {
    memoryData[roomNumber].fateCard = GetFateCard(roomNumber);
    memoryData[roomNumber].status = "CARD";
    memoryData[roomNumber]["usersList"].map(p => {
      p.socket.emit("CHANGE_ROOM_STAGE", {
        status: "CARD",
        fateCard: memoryData[roomNumber].fateCard
      })
    })
  }
}

function OnCheckCard(args, socket) {
  let roomNumber = args.roomNumber, memberIndex = args.memberIndex;

  // todo 
  // 操作的合法性判断

  let currUserIndex = memoryData[roomNumber]["usersList"].findIndex((obj => obj.memberIndex == memberIndex));
  if (memoryData[roomNumber]["usersList"][currUserIndex].money < checkCardFee) {
    return;
  }
  memoryData[roomNumber]["usersList"][currUserIndex].money -= checkCardFee;
  memoryData[roomNumber].jackpot += checkCardFee;
  //memoryData[roomNumber].currentPlayerIndex = memoryData[roomNumber].currentPlayerIndex + 1 % roomPlayerLimit;
  memoryData[roomNumber].currentPlayerIndex = GetNextPlayerIndex(
    memoryData[roomNumber].currentPlayerIndex,
    memoryData[roomNumber].usersList,
    roomPlayerLimit
  );

  // todo 
  // check judger / fate card effect
  var t = GetNextCard(memoryData[roomNumber]["usersList"][currUserIndex].remainCards)
  if (t !== null) {
    memoryData[roomNumber]["usersList"][currUserIndex].handCards.push(t);
  }

  // check card player get new hand card info, remain card number , new money, jackpot money, next player index
  socket.emit("MY_CHECK_CARD", {
    handCards: memoryData[roomNumber]["usersList"][currUserIndex].handCards,
    remainCardsNum: memoryData[roomNumber]["usersList"][currUserIndex].remainCards.length,
    money: memoryData[roomNumber]["usersList"][currUserIndex].money,
    jackpot: memoryData[roomNumber].jackpot,
    currentPlayerIndex: memoryData[roomNumber].currentPlayerIndex
  })
  // other players get new money, hand cards number, jackpot money, next player index
  memoryData[roomNumber]["usersList"].map(p => {
    if (p.memberIndex !== memberIndex) {
      p.socket.emit("OTHER_CHECK_CARD", {
        jackpot: memoryData[roomNumber].jackpot,
        prePlayerIndex: memoryData[roomNumber]["usersList"][currUserIndex].memberIndex,
        money: memoryData[roomNumber]["usersList"][currUserIndex].money,
        handCardsNum: memoryData[roomNumber]["usersList"][currUserIndex].handCards.length,
        currentPlayerIndex: memoryData[roomNumber].currentPlayerIndex
      })
    }
  })
}

function OnFoldCard(args, socket) {
  let roomNumber = args.roomNumber, memberIndex = args.memberIndex;

  let currUserIndex = memoryData[roomNumber]["usersList"].findIndex((obj => obj.memberIndex == memberIndex));
  memoryData[roomNumber]["usersList"][currUserIndex].status = "FOLDED";
  memoryData[roomNumber].currentPlayerIndex = GetNextPlayerIndex(
    memoryData[roomNumber].currentPlayerIndex,
    memoryData[roomNumber].usersList,
    roomPlayerLimit
  );

  // if all folded -> to judge stage
  let foldedPlayerNum = 0;
  memoryData[roomNumber]["usersList"].map(p => {
    if (p.status == "FOLDED") {
      foldedPlayerNum++;
    }
  });
  if (foldedPlayerNum == roomPlayerLimit) {
    memoryData[roomNumber].status = "JUDGE";
    memoryData[roomNumber]["usersList"].map(p => {
      p.socket.emit("CHANGE_ROOM_STAGE", {
        status: "JUDGE",
        playerStatus: p.status
      })
    })
    JudgeTableCards(roomNumber);
  }
  // next player
  else {
    memoryData[roomNumber]["usersList"].map(p => {
      p.socket.emit("FOLD_CARD", {
        preFoldPlayerIndex: memberIndex,
        currentPlayerIndex: memoryData[roomNumber].currentPlayerIndex,
        playerStatus: p.status
      })
    })
  }
}

function OnUseCard(args, socket) {
  let { roomNumber, memberIndex, cardId, useCardFee } = args;
  // let preUseCardFee = memoryData[roomNumber].preUseCardFee;
  let currUserIndex = memoryData[roomNumber]["usersList"].findIndex((obj => obj.memberIndex == memberIndex));

  // first use card
  if (memoryData[roomNumber]["usersList"][currUserIndex].status !== "PAID_USE_CARD") {

    memoryData[roomNumber]["usersList"][currUserIndex].status = "PAID_USE_CARD";
    memoryData[roomNumber]["usersList"][currUserIndex].money -= useCardFee;
    memoryData[roomNumber].jackpot += useCardFee;
    memoryData[roomNumber].preUseCardFee = useCardFee;

  }

  // remove card from hand card, add to table cards
  let cardIndexInHandCards = memoryData[roomNumber]["usersList"][currUserIndex].handCards.findIndex((obj => obj.id == cardId));
  let card = memoryData[roomNumber]["usersList"][currUserIndex].handCards.splice(cardIndexInHandCards, 1)[0];
  if (card !== null) {
    memoryData[roomNumber].tableCards.push(card);
    // todo
    //active card
    ActiveCard(card, memoryData[roomNumber]);
  }

  // send table cards, hand cards, jackpot, status to curr player
  socket.emit("MY_USE_CARD", {
    tableCards: memoryData[roomNumber].tableCards,
    handCards: memoryData[roomNumber]["usersList"][currUserIndex].handCards,
    jackpot: memoryData[roomNumber].jackpot,
    status: memoryData[roomNumber]["usersList"][currUserIndex].status
  })

  // send table cards, hand cards number of curr_player, jackpot, preUseCardFee to other player
  memoryData[roomNumber]["usersList"].map(p => {
    if (p.memberIndex !== memberIndex) {
      p.socket.emit("OTHER_USE_CARD", {
        useCardPlayerIndex: memberIndex,
        useCardPlayerHandCardsNumber: memoryData[roomNumber]["usersList"][currUserIndex].handCards.length,
        useCardPlayerStatus: memoryData[roomNumber]["usersList"][currUserIndex].status,
        jackpot: memoryData[roomNumber].jackpot,
        preUseCardFee: memoryData[roomNumber].preUseCardFee,
        tableCards: memoryData[roomNumber].tableCards,
      });
    }
  })
}

function OnEndUseCard(args, socket) {
  let { roomNumber, memberIndex, } = args;

  let currUserIndex = memoryData[roomNumber]["usersList"].findIndex((obj => obj.memberIndex == memberIndex));
  memoryData[roomNumber]["usersList"][currUserIndex].status = "NOT_FOLDED";
  memoryData[roomNumber].currentPlayerIndex = GetNextPlayerIndex(
    memoryData[roomNumber].currentPlayerIndex,
    memoryData[roomNumber].usersList,
    roomPlayerLimit
  );

  memoryData[roomNumber].usersList.map(p => {
    p.socket.emit("END_USE_CARD", {
      status: memoryData[roomNumber]["usersList"][currUserIndex].status,
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
  memoryData[roomNumber].usersList.map(p => {
    p.socket.emit("JUDGE_INIT_FIGHTERS", {
      fightersInfo: memoryData[roomNumber].fightersInfo
    })
  });

  // active card
  memoryData[roomNumber].tableCards.map(card => {
    // todo
    ActiveCard(card, memoryData[roomNumber]);
    memoryData[roomNumber].usersList.map(p => {

      let currentPlayerHandCards = p.handCards;
      let currentPlayerRemainCardsNum = p.remainCards.length;
      let otherPlayerList = [];
      usersList.map(p => p.userId !== u.userId).map(o => {
        otherPlayerList.push({
          money: o.money,
          handCardsNum: o.handCards.length,
          memberIndex: o.memberIndex,
          status: o.status
        })
      })

      const { seed, rand, jackpot, currentRound, currentPlayerIndex,
        judgerCard, fateCard, fightersInfo,
        preUseCardFee, preUseCardPlayerIndex,
        tableCards } = memoryData[roomNumber];
      p.socket.emit("JUDGE_ACTIVE_CARD", {
        seed, rand, jackpot, status: p.status,
        currentRound, currentPlayerIndex,
        judgerCard, fateCard, fightersInfo,
        tableCards,
        preUseCardFee, preUseCardPlayerIndex,
        handCards: currentPlayerHandCards,
        remainCardsNum: currentPlayerRemainCardsNum,
        otherPlayerList
      });

    })
  })

  memoryData[roomNumber].status = "CALC";
  memoryData[roomNumber].usersList.map(p => {
    p.socket.emit("CHANGE_ROOM_STAGE", {
      status: memoryData[roomNumber].status,
    })
  });
  CalcWinnerFighter(roomNumber, memoryData[roomNumber]);
}

function CalcWinnerFighter(roomNumber, roomData) {
  let winnerFighterIndex = 0;
  if (roomData.judgerCard.OnCalcStage != null) {
    winnerFighterIndex = roomData.judgerCard.OnCalcStage(roomNumber, roomData, winnerFighterIndex);
  }
  roomData.fightersInfo.map(f => {
    if (f.OnCalcStage !== null) {
      winnerFighterIndex = roomData.fateCard.OnCalcStage(roomNumber, roomData, winnerFighterIndex);
    }
  })
  if (roomData.fateCard.OnCalcStage != null) {
    winnerFighterIndex = roomData.fateCard.OnCalcStage(roomNumber, roomData, winnerFighterIndex);
  }
  roomData.usersList.map(p => {
    p.socket.emit("WINNER_FIGHTER", {
      winnerFighterIndex
    });
  })

  // calculate jackpot
  CalcJackpot(roomNumber, roomData, winnerFighterIndex);
  // new round
  InitNewRound(roomNumber, roomData);
}

function CalcJackpot(roomNumber, roomData, winnerFighterIndex) {
  let winnerFighterId = roomData.fightersInfo[winnerFighterIndex].id;

  let betRightPlayerList = []
  // bet money
  roomData.usersList.map(p => {
    let betOnWinnerIndex = p.betInfos.findIndex(obj => obj.fighterId == winnerFighterId);
    if (betOnWinnerIndex >= 0) {
      if (p.betInfos.length == 3) {
        p.money += 1.0 * p.betInfos[betOnWinnerIndex].betMoney * roomData.fightersInfo[winnerFighterIndex].magnification;
      } else if (p.betInfos.length == 2) {
        p.money += 1.5 * p.betInfos[betOnWinnerIndex].betMoney * roomData.fightersInfo[winnerFighterIndex].magnification;
      } else if (p.betInfos.length == 1) {
        p.money += 2.0 * p.betInfos[betOnWinnerIndex].betMoney * roomData.fightersInfo[winnerFighterIndex].magnification;
      }
      betRightPlayerList.push({
        memberIndex: p.memberIndex,
        number: p.betInfos.length == 2 ? 2 : (p.betInfos.length == 3 ? 1 : 3)
      })
    }
  });

  // jackpot
  let totalNumer = 0;
  betRightPlayerList.map(t => {
    totalNumer += t.number;
  });
  betRightPlayerList.map(p => {
    let playerIndex = roomData.usersList.findIndex(obj => obj.memberIndex == p.memberIndex);
    roomData.usersList[playerIndex].money += jackpot / totalNumer * p.number;
  });
}

function InitNewRound(roomNumber, roomData) {
  // last round game end
  if (roomData.currentRound == roundNumLimit) {
    roomData.usersList.sort(function (a, b) {
      return parseFloat(a.money) - parseFloat(b.money);
    });
    roomData.usersList.map(p => {
      p.socket.emit("GAME_END", {
        // game end
        rankList: roomData.usersList
      });
    })
  } else {
    roomData.currentRound++;
    // init new round info
    roomData.status = "BET";
    roomData.startPlayerIndex = (roomData.startPlayerIndex + 1) % roomPlayerLimit;
    roomData.currentPlayerIndex = roomData.startPlayerIndex;
    roomData.preUseCardFee = 0;
    roomData.preUseCardPlayerIndex = 0;
    roomData.fateCard = null;

    // add new judger
    let tmpJudgers = [...Judgers];
    var ranJudgerIndex = Math.floor(Math.random() * tmpJudgers.length);
    roomData.judgerCard = tmpFighters.splice(ranJudgerIndex, 1)[0];

    roomData.jackpot = 0;
    roomData.tableCards = [];

    // generate new fighters 
    let tmpFighters = [...Fighters];
    let initFighters = [];
    for (var i = 0; i < fighterNumLimit; i++) {
      var ran = Math.floor(Math.random() * tmpFighters.length);
      let t = tmpFighters.splice(ran, 1)[0];
      Object.assign(t, {
        betInfos: []
      })
      initFighters.push(t);
    };
    roomData.fightersInfo = initFighters;

    // clear user info
    roomData.usersList.map(u => {
      u.status = "NOT_BETED";
      u.betInfos = [];

      // get hand cards;
      u.handCards = [];
      u.remainCards = shuffle(memoryData[roomNumber].rand, Cards.map((c, index) => Object.assign({ k: index }, c)));
      for (var i = 0; i < 3; i++) {
        var t = GetNextCard(u.remainCards)
        if (t !== null) {
          u.handCards.push(t);
        }
      }
    });

    SendInitDataToAll(roomNumber);
  }
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
  let otherIdentity = identity === "one" ? "two" : "one";

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