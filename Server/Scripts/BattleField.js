class BattleField
{
    constructor() {
        this.UpdateQueue = [];
    }

    // Queue操作方法
    GetUpdateQueue()
    {
        return this.UpdateQueue;
    }
    GetUpdateQueueSize()
    {
        return this.UpdateQueue.length;
    }
    GetUpdateQueueFront()
    {
        return this.UpdateQueue[0];
    }
    PushUpdateQueue(item)
    {
        if (item instanceof Array){
            this.UpdateQueue = this.UpdateQueue.concat(item);
        }
        else 
        {
            this.UpdateQueue.push(item);
        }
    }
    PopUpdateQueue()
    {
        return this.UpdateQueue.shift();
    }

    // 管理Queue内容
    OnPlayerUseCard(GameData, UsedCard, UseInfo)
    {
        this.PushUpdateQueue({
            Type: "OnAfterUseCard",
            UsedCard, UseInfo,
            CurrCard: UsedCard
        });
        // 向队列中添加可能受影响的卡牌及其影响类型
        for (let idx = 0;idx< GameData.TableCardList;idx++)
        {
            let tc = GameData.TableCardList[idx];
            if (tc.OnAfterUseOtherCard)
            {
                this.PushUpdateQueue({
                    Type: "OnAfterUseOtherCard",
                    UsedCard, UseInfo,
                    CurrCard: tc
                })
            }
        }
        for (let idx =0;idx< GameData.PlayerList.length;idx++)
        {
            let p =  GameData.PlayerList[idx];
            for (let cIdx = 0;cIdx < p.HandCards.length;cIdx++)
            {
                if (p.HandCards[cIdx].OnAfterUseOtherCard)
                {
                    this.PushUpdateQueue({
                        Type: "OnAfterUseOtherCard",
                        UsedCard, UseInfo,
                        CurrCard: p.HandCards[cIdx]
                    })
                }
            }
        }
        let TmpGameData = this.UpdateBattleField(GameData);
        return TmpGameData;
    }

    UpdateBattleField(GameData)
    {
        let TmpGameData = GameData;
        while (this.GetUpdateQueueSize() > 0)
        {
            const CurrentActiveInfo = this.GetUpdateQueueFront();
            // TODO
            const {Type, CurrCard, UsedCard, UseInfo} = CurrentActiveInfo;
            if (Type == "OnAfterUseCard")
            {
                if (CurrCard.OnAfterUseCard)
                {
                    TmpGameData = CurrCard.OnAfterUseCard(TmpGameData, this.UpdateQueue, CurrCard, UseInfo);
                }
            }
            if (Type == "OnAfterUseOtherCard")
            {
                if (CurrCard.OnAfterUseCard)
                {
                    TmpGameData = CurrCard.OnAfterUseCard(TmpGameData, this.UpdateQueue, CurrCard, UsedCard, UseInfo);
                }
            }
            if (Type == "OnAfterCardActiveInJudgeStage")
            {

            }
            if (Type == "OnAfterOtherCardActiveInJudgeStage")
            {

            }
            this.PopUpdateQueue();
        }
        return TmpGameData;
    }
}

module.exports = BattleField;