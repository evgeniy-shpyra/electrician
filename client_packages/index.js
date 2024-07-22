mp.keys.bind(0x45, true, function () {
  mp.events.callRemote('tryHandleMarker')
})

mp.events.add('startWorkAnimation', async () => {
  const player = mp.players.local

  const animDict = 'anim@amb@business@weed@weed_sorting_seated@'
  const animName = 'sorter_right_sort_v2_sorter02'

  if (!mp.game.streaming.hasAnimDictLoaded(animDict)) {
    mp.gui.chat.push(mp.game.streaming.requestAnimDict(animDict))
    while (!mp.game.streaming.hasAnimDictLoaded(animDict)) {
      await mp.game.waitAsync(0)
    }
  }

  player.taskPlayAnim(animDict, animName, 8, 8, -1, 0, 0.0, false, false, false)
})

const changePlayerMoney = (player, money) => {
  player.setMoney(money)
  mp.game.stats.statSetInt(mp.game.joaat('SP0_TOTAL_CASH'), money, true)
}

// changePlayerMoney(mp.players.local, 0)
mp.events.add('displayMoney', async (money) => {
  const player = mp.players.local
  changePlayerMoney(player, money)
})
