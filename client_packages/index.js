let isOnToggleWorkShape = false

// init marker
const toggleWorkPosition = new mp.Vector3(732.56, 131.26, 79.75)
const radius = 1.2
const toggleWorkShape = mp.colshapes.newSphere(
  toggleWorkPosition.x,
  toggleWorkPosition.y,
  toggleWorkPosition.z,
  radius
)
mp.markers.new(1, toggleWorkPosition, 1)

let activeWorkMarker = null
let activeWorkShape = null
mp.events.add('newWorkMarker', (position) => {
  const radius = 1.5
  activeWorkShape = mp.colshapes.newSphere(
    position.x,
    position.y,
    position.z,
    radius
  )
  activeWorkMarker = mp.markers.new(1, position, 1, {
    color: [255, 0, 0, 100],
  })
})

mp.events.add('playerEnterColshape', (shape) => {
  if (shape.id === toggleWorkShape.id) {
    isOnToggleWorkShape = true
  }
})
mp.events.add('playerExitColshape', (shape) => {
  if (shape.id === toggleWorkShape.id) {
    isOnToggleWorkShape = false
  }
})

mp.keys.bind(0x45, true, function () {
  mp.events.callRemote('pressE')
  if (isOnToggleWorkShape) {
    mp.events.callRemote('toggleWork')
  }
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

changePlayerMoney(mp.players.local, 0)
mp.events.add('displayMoney', async (money) => {
  const player = mp.players.local
  changePlayerMoney(player, money)
})
