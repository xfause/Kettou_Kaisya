function OnUseStageActiveCard(card, roomData, needTarget, targetType, targetId, userIndex) {
  // targetId
  // if targetType == "table"
  //    targetId means index in table cards list
  // else 
  //    targetId means fighter id
  
  // todo
  // do nothing now
  let tempRoomData = roomData;

  // OnOtherCardUseStart
  for (let c in tempRoomData.tableCards) {
    if (c.OnOtherCardUseStart !== null && c.OnOtherCardUseStart !== undefined) {
      tempRoomData = c.OnOtherCardUseStart(tempRoomData, needTarget, targetType, targetId, userIndex) 
    }
  }

  // use current card
  if (card.OnCardUse !== null && card.OnCardUse !== undefined) {
    tempRoomData = card.OnCardUse(tempRoomData, needTarget, targetType, targetId, userIndex)
  }

  // OnOtherCardUseEnd
  for (let c in tempRoomData.tableCards) {
    if (c.OnOtherCardUseEnd !== null && c.OnOtherCardUseEnd !== undefined) {
      tempRoomData = c.OnOtherCardUseEnd(tempRoomData, needTarget, targetType, targetId, userIndex) 
    }
  }

  return tempRoomData;
}

// todo
function OnJudgeStageActiveCard() {
  
}

// todo
function OnCalcStageActiveCard() {
  
}

module.exports = {
  OnUseStageActiveCard,
  OnJudgeStageActiveCard,
  OnCalcStageActiveCard
}