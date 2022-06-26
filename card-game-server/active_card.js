function OnUseStageActiveCard(card, roomData, needTarget, targetType, targetId, userIndex) {
  // targetId
  // if targetType == "table"
  //    targetId means index in table cards list
  // else 
  //    targetId means fighter id

  let tempRoomData = roomData;

  // if judger card have OnCardStage method
  if (tempRoomData.judgerCard.OnCardStage != null) {
    tempRoomData = tempRoomData.judgerCard.OnCardStage(tempRoomData);
  }

  // OnOtherCardUseStart
  for (let c in tempRoomData.tableCards) {
    if (c.OnOtherCardUseStart !== null && c.OnOtherCardUseStart !== undefined) {
      tempRoomData = c.OnOtherCardUseStart(tempRoomData, needTarget, targetType, targetId, userIndex) 
    }
  }

  // use current card
  if (card.OnCardUse !== null && card.OnCardUse !== undefined) {
    // if is effect card, it will use in judge stage
    if (card.type == "EFFECT") {
      if (tempRoomData.status == "JUDGE") {
        tempRoomData = card.OnCardUse(tempRoomData, needTarget, targetType, targetId, userIndex)
      }
    } else {
      tempRoomData = card.OnCardUse(tempRoomData, needTarget, targetType, targetId, userIndex)
    }
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
function OnJudgeStageActiveCard(card, roomData) {
  let tempRoomData = roomData;
  let { needTarget, targetType, targetId, userIndex } = card;

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

  // if judger card have OnJudgeStage method
  if (tempRoomData.judgerCard.OnJudgeStage != null) {
    tempRoomData = tempRoomData.judgerCard.OnJudgeStage(tempRoomData);
  }

  return tempRoomData;
}

// todo
function OnCalcStageActiveCard() {
  
}

module.exports = {
  OnUseStageActiveCard,
  OnJudgeStageActiveCard,
  OnCalcStageActiveCard
}