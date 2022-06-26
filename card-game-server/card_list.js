// todo
// card function
// OnCardUse (roomData, needTarget, targetType, targetId, userIndex)
// OnOtherCardUseStart
// OnOtherCardUseEnd
// OnJudgeStart
// OnJudgeEnd
// OnCalcStart
// OnCalcEnd

// return roomData

// changes = {
//   health: x,
//   magic: y,
//   cardType: "HIT / EFFECT",
//   addStatus: [],
//   minusStatus: [],
//   userAddStatus: [],
//   userMinusStatus: [],
//   otherPlayerAddStatus: [{
//     playerIndex: 1,
//     list: []
//   }],
//   otherPlayerMinusStatus: [{
//     playerIndex: 1,
//     list: []
//   }],
// }

const CHANGE_TEMPLATE = {
  health: 0,
  magic: 0,
  cardType: "",
  addStatus: [],
  minusStatus: [],
  userAddStatus: [],
  userMinusStatus: [],
  otherPlayerAddStatus: [],
  otherPlayerMinusStatus: [],
}

const TestCardList = [
  {
    id: 1,
    name: "初级过载",
    type: "HIT",
    desc: "+5 +3",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 5;
          changes.magic = 3;
          changes.cardType = "HIT";
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 2,
    name: "初级冷却",
    type: "HIT",
    desc: "+0 -5",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 0;
          changes.magic = -5;
          changes.cardType = "HIT";
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 3,
    name: "预热",
    type: "HIT",
    desc: "+2 +0 本回合内下一张卡牌效果+2/+1",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 2;
          changes.magic = 0;
          changes.cardType = "HIT";
          changes.userAddStatus = ["WARM_UP"];
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 4,
    name: "信号增强",
    type: "EFFECT",
    desc: "+1 +0 在该卡牌生效后,指定角斗士接下来两次生命值/法力值变化+2/+0",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 1;
          changes.magic = 0;
          changes.cardType = "EFFECT";
          changes.addStatus = ["STRENGTHEN_TWICE", "STRENGTHEN_TWICE"];
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }
]

const CardList = [
  {
    id: 1,
    name: "初级过载",
    type: "HIT",
    desc: "+5 +3",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 5;
          changes.magic = 3;
          changes.cardType = "HIT";
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 2,
    name: "初级过载",
    type: "HIT",
    desc: "+5 +3",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 5;
          changes.magic = 3;
          changes.cardType = "HIT";
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 3,
    name: "中级过载",
    type: "HIT",
    desc: "+8 +5",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 8;
          changes.magic = 5;
          changes.cardType = "HIT";
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 4,
    name: "高级过载",
    type: "HIT",
    desc: "+12 +8",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 12;
          changes.magic = 8;
          changes.cardType = "HIT";
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 5,
    name: "终级过载",
    type: "HIT",
    desc: "+18 +11",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 18;
          changes.magic = 11;
          changes.cardType = "HIT";
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 6,
    name: "初级冷却",
    type: "HIT",
    desc: "+0 -5",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 0;
          changes.magic = -5;
          changes.cardType = "HIT";
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 7,
    name: "高级冷却",
    type: "HIT",
    desc: "+0 -9",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 0;
          changes.magic = -9;
          changes.cardType = "HIT";
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 8,
    name: "预热",
    type: "HIT",
    desc: "+2 +0 本回合内下一张卡牌效果+2/+1",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 2;
          changes.magic = 0;
          changes.cardType = "HIT";
          changes.userAddStatus = ["WARM_UP"];
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 9,
    name: "高级预热",
    type: "HIT",
    desc: "+3 +2 本回合内下一张卡牌效果+4/+1",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 3;
          changes.magic = 2;
          changes.cardType = "HIT";
          changes.userAddStatus = ["WARM_UP_PLUS"];
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 12,
    name: "信号削弱",
    type: "EFFECT",
    desc: "+1 +0 在该卡牌生效后,指定角斗士接下来两次生命值/法力值变化-3/-1",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 1;
          changes.magic = 0;
          changes.cardType = "EFFECT";
          changes.addStatus = ["WEAKEN_TWICE", "WEAKEN_TWICE"];
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }, {
    id: 13,
    name: "信号增强",
    type: "EFFECT",
    desc: "+1 +0 在该卡牌生效后,指定角斗士接下来两次生命值/法力值变化+2/+0",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId, userIndex) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          let changes = { ...CHANGE_TEMPLATE };
          changes.health = 1;
          changes.magic = 0;
          changes.cardType = "EFFECT";
          changes.addStatus = ["STRENGTHEN_TWICE", "STRENGTHEN_TWICE"];
          changes = CheckFighterStatus(changes, roomData, fIndex, userIndex);
          roomData["fightersInfo"][fIndex].health += changes.health;
          roomData["fightersInfo"][fIndex].magic += changes.magic;
          roomData = ChangeStatusList(roomData, changes, fIndex, userIndex);
        }
      }
      return roomData;
    },
  }
]

function ChangeStatusList(rD, changes, fighteIndex, userIndex) {
  let roomData = { ...rD };
  if (changes.cardType != "HIT" && roomData.status != "JUDGE") {
    return roomData;
  }
  roomData["fightersInfo"][fighteIndex].statusList = roomData["fightersInfo"][fighteIndex].statusList.concat(changes.addStatus);
  for (let i = 0; i < changes.minusStatus.length; i++) {
    let sIndex = roomData["fightersInfo"][fighteIndex].statusList.indexOf(changes.minusStatus[i]);
    if (sIndex != -1) {
      roomData["fightersInfo"][fighteIndex].statusList.splice(sIndex, 1);
    }
  }
  roomData["usersList"][userIndex].statusList = roomData["usersList"][userIndex].statusList.concat(changes.userAddStatus);
  for (let i = 0; i < changes.userMinusStatus.length; i++) {
    let sIndex = roomData["usersList"][userIndex].statusList.indexOf(changes.userMinusStatus[i]);
    if (sIndex != -1) {
      roomData["usersList"][userIndex].statusList.splice(sIndex, 1);
    }
  }
  for (let i = 0; i < changes.otherPlayerAddStatus.length; i++) {
    roomData["usersList"][changes.otherPlayerAddStatus[i].playerIndex].statusList =
      roomData["usersList"][changes.otherPlayerAddStatus[i].playerIndex].statusList.concat(changes.otherPlayerAddStatus[i].list);
  }
  for (let i = 0; i < changes.otherPlayerMinusStatus.length; i++) {
    let tI = changes.otherPlayerAddStatus[i];
    for (let j = 0; j < tI.list.length; j++) {
      let sIndex = roomData["usersList"][tI.playerIndex].statusList.indexOf(tI.list[j]);
      if (sIndex != -1) {
        roomData["usersList"][tI.playerIndex].statusList.splice(sIndex, 1);
      }
    }
  }
  return roomData;
}

function CheckFighterStatus(changes, roomData, fighteIndex, userIndex) {
  
  let fChanges = { ...changes };
  let fighterInfo = roomData["fightersInfo"][fighteIndex];
  let playerInfo = roomData["usersList"][userIndex];
  let fighterStatusList = fighterInfo.statusList;
  let userStatusList = playerInfo.statusList;

  if (fChanges.cardType != "HIT" && roomData.status != "JUDGE") {
    fChanges = { ...CHANGE_TEMPLATE };
    fChanges.cardType = changes.cardType;
    return fChanges;
  }

  if (userStatusList.includes("WARM_UP")) {
    fChanges.health = fChanges.health + 2;
    fChanges.magic = fChanges.magic + 1;
    fChanges.minusStatus = fChanges.userMinusStatus.concat(["WARM_UP"]);
  }

  if (userStatusList.includes("WARM_UP_PLUS")) {
    fChanges.health = fChanges.health + 4;
    fChanges.magic = fChanges.magic + 1;
    fChanges.minusStatus = fChanges.userMinusStatus.concat(["WARM_UP_PLUS"]);
  }

  if (fighterStatusList.includes("WEAKEN_TWICE")) {
    fChanges.health = fChanges.health - 3;
    fChanges.magic = fChanges.magic - 1;
    fChanges.minusStatus = fChanges.minusStatus.concat(["WEAKEN_TWICE"]);
  }

  if (fighterStatusList.includes("STRENGTHEN_TWICE")) {
    fChanges.health = fChanges.health + 2;
    fChanges.magic = fChanges.magic + 0;
    fChanges.minusStatus = fChanges.minusStatus.concat(["STRENGTHEN_TWICE"]);
  }

  // last step
  if (fighterStatusList.includes("NO_HIT")) {
    if (fChanges.cardType == "HIT") {
      fChanges.health = 0;
      fChanges.magic = 0;
      fChanges.addStatus = [];
      fChanges.minusStatus = [];
      return fChanges;
    }
  }

  if (fighterStatusList.includes("HALF_MAGIC")) {
    fChanges.magic = fChanges.magic / 2;
  }
  if (fighterStatusList.includes("NUM_OPPOSITE")) {
    fChanges.health = -fChanges.health;
    fChanges.magic = -fChanges.magic;
  }

  return fChanges;
}

module.exports = {
  // Cards: CardList,
  Cards: TestCardList,
}