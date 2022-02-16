// todo
// card function
// OnCardUse (roomData, needTarget, targetType, targetId) 
// OnOtherCardUseStart
// OnOtherCardUseEnd
// OnJudgeStart
// OnJudgeEnd
// OnCalcStart
// OnCalcEnd

// return roomData

const CardList = [
  {
    id: 1,
    name: "初级过载",
    type: "HIT",
    desc: "+5 +3",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          roomData["fightersInfo"][fIndex].health += 5;
          roomData["fightersInfo"][fIndex].magic += 3;
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
    OnCardUse: function (roomData, needTarget, targetType, targetId) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          roomData["fightersInfo"][fIndex].health += 5;
          roomData["fightersInfo"][fIndex].magic += 3;
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
    OnCardUse: function (roomData, needTarget, targetType, targetId) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          roomData["fightersInfo"][fIndex].health += 8;
          roomData["fightersInfo"][fIndex].magic += 5;
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
    OnCardUse: function (roomData, needTarget, targetType, targetId) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          roomData["fightersInfo"][fIndex].health += 12;
          roomData["fightersInfo"][fIndex].magic += 8;
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
    OnCardUse: function (roomData, needTarget, targetType, targetId) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          roomData["fightersInfo"][fIndex].health += 18;
          roomData["fightersInfo"][fIndex].magic += 11;
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
    OnCardUse: function (roomData, needTarget, targetType, targetId) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          roomData["fightersInfo"][fIndex].magic -= 5;
        }
      }
      return roomData;
    },
  }, {
    id: 7,
    name: "初级冷却",
    type: "HIT",
    desc: "+0 -9",
    needTarget: true,
    targetType: "fighter",
    targetId: -1,
    OnCardUse: function (roomData, needTarget, targetType, targetId) {
      if (needTarget) {
        if (targetType == "fighter") {
          let fIndex = roomData["fightersInfo"].findIndex((obj => obj.id == targetId));
          roomData["fightersInfo"][fIndex].magic -= 9;
        }
      }
      return roomData;
    },
  }
]

module.exports = {
  Cards: CardList,
}