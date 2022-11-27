

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