const CardList = [
    {
      Id: "1",
      Name: "Card 1",
      Desc: "使用时 - 目标生命值+2,魔力值+1\n使用时 - 从牌库中抽取1张牌",
      DefaultIsActive: true,
      IsActive: false,
      IsNeedTarget: true,
      TargetType: "Fighter",
      OnAfterUseCard: function(GameData, UpdateQueue, CurrCard, UseInfo){
        const { TargetType, TargetId, PlayerIndex } = UseInfo;
        let tGameData = {...GameData};
        if (TargetType == "FIGHTER")
        {
          let fIdx = tGameData.FighterInfoList.findIndex(obj=>obj.Idx == TargetId);
          let tFighterInfo = tGameData.FighterInfoList[fIdx];
          // 目标生命值+2,魔力值+1
          tFighterInfo.Health += 2;
          tFighterInfo.Magic += 1;
          tGameData.FighterInfoList[fIdx] = tFighterInfo;
          // 从牌库中抽取1张牌
          let pIdx = tGameData.PlayerList.findIndex(obj=> obj.Index == PlayerIndex);
          let tRemainCards = [...tGameData.PlayerList[pIdx].RemainCards];
          let tNewCardIdx = Math.floor(Math.random() * tRemainCards.length);
          let tNewCard = tRemainCards.splice(tNewCardIdx, 1)[0];
          tGameData.PlayerList[pIdx].RemainCards = tRemainCards;
          tGameData.PlayerList[pIdx].HandCards.push(tNewCard)
        }
        return tGameData;
      }
    },
    {
      Id: "占位ID 2",
      Name: "占位Name 2",
      Desc: "占位Desc 3",
    },
    {
      Id: "占位ID 3",
      Name: "占位Name 3",
      Desc: "占位Desc 3",
    },
    {
      Id: "占位ID 4",
      Name: "占位Name 4",
      Desc: "占位Desc 4",
    },
  ];
  
  module.exports = {
    CardList: CardList,
  }