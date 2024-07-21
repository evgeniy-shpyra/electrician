require('./tools/index.js')

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

const workPlacesPosition = [
  new mp.Vector3(664.6714477539062, 112.72749328613281, 80),
  new mp.Vector3(670.2241821289062, 128.05892944335938, 80),
  new mp.Vector3(664.2767944335938, 130.1977996826172, 80),
  new mp.Vector3(686.7776489257812, 144.71788024902344, 80),
  new mp.Vector3(692.6104736328125, 142.69354248046875, 80),
  new mp.Vector3(685.4440307617188, 169.13719177246094, 80),
  new mp.Vector3(679.611572265625, 171.16233825683594, 80),
  new mp.Vector3(709.9921264648438, 165.68577575683594, 80),
  new mp.Vector3(717.9031982421875, 153.10841369628906, 80),
  new mp.Vector3(703.252197265625, 119.6226806640625, 80),
  new mp.Vector3(709.0304565429688, 117.49996948242188, 80),
  new mp.Vector3(703.2955932617188, 102.20745849609375, 80),
  new mp.Vector3(697.4491577148438, 104.26578521728516, 80),
]

const workPlaces = []

const initWorkerMarkers = () => {
  for (let i = 0; i < workPlacesPosition.length; i++) {
    const position = workPlacesPosition[i]
    const shape = mp.colshapes.newSphere(
      position.x,
      position.y,
      position.z,
      1.1
    )
    const marker = mp.markers.new(1, position, 1, {
      color: [255, 0, 0, 100],
      visible: false,
    })

    workPlaces.push({
      id: i,
      playerId: null,
      isWork: false,
      marker,
      shape,
    })
  }
}
initWorkerMarkers()

const createWorkPlace = (player, prevWorkPlace) => {
  const freePositions = workPlaces.filter(
    (w) =>
      (w.playerId === null && !prevWorkPlace) ||
      (prevWorkPlace && prevWorkPlace.id !== w.id)
  )
  const randomIndex = getRandomInt(0, freePositions.length - 1)
  const { id, marker } = freePositions[randomIndex]

  const index = workPlaces.findIndex((w) => w.id === id)
  workPlaces[index].playerId = player.id

  marker.showFor(player)
}

const removeWorkPlace = (player) => {
  const indexOfWorkPlace = workPlaces.findIndex((w) => w.playerId === player.id)
  if (indexOfWorkPlace < 0) return

  const workPlace = workPlaces[indexOfWorkPlace]
  workPlace.playerId = null
  workPlace.isWork = false
  workPlace.marker.hideFor(player)
}

const togglePlayerWork = (player, isWork) => {
  if (isWork) {
    // Додавання форми
    player.model = mp.joaat('mp_m_freemode_181')
    player.setClothes(3, 181, 0, 0)
    player.setClothes(8, 181, 0, 0)

    // Оповіщення
    player.outputChatBox('Вас прийнято на роботу. Робочий день розпочато.')
    player.notify('~g~Вирушайте на першу мiтку')

    player.setVariable('isWork', true)

    // Створення робочого місця
    createWorkPlace(player)
  } else {
    // Видалення форми
    player.model = mp.joaat('mp_m_freemode_01')
    player.setClothes(3, 0, 0, 0)
    player.setClothes(8, 0, 0, 0)

    // Видалення робочого місця
    removeWorkPlace(player)

    // Оповіщення
    player.outputChatBox('Вас звільнено з роботи.')
    player.setVariable('isWork', false)
  }
}

const addSalary = (player, amount) => {
  const currAmount = player.getOwnVariable('money') || 0

  const totalSalary = player.getOwnVariable('totalSalary') || 0

  const newAmount = currAmount + amount
  player.setOwnVariable('money', newAmount)
  player.setOwnVariable('totalSalary', totalSalary + amount)

  player.call('displayMoney', [newAmount])
}

const removeAllSalary = (player) => {
  const totalSalary = player.getOwnVariable('totalSalary')
  if (!totalSalary) return

  const allAmount = player.getOwnVariable('money') || 0

  const newAmount = allAmount - totalSalary
  player.setOwnVariable('money', newAmount)
  player.setOwnVariable('totalSalary', 0)
  player.outputChatBox(`newAmount ${newAmount}, allAmount ${allAmount}`)
  player.call('displayMoney', [newAmount])
}

mp.events.add('toggleWork', (player) => {
  const isWork = player.getVariable('isWork') ? true : false
  togglePlayerWork(player, !isWork)
})

mp.events.add('playerDeath', (player) => {
  const isWork = player.getVariable('isWork')
  if (isWork) {
    togglePlayerWork(player, false)
    removeAllSalary(player)
  }
})

mp.events.add('pressE', async (player) => {
  const indexOfWorkPlace = workPlaces.findIndex((w) => w.playerId === player.id)
  if (indexOfWorkPlace < 0) return

  const workPlace = workPlaces[indexOfWorkPlace]
  if (workPlace.isWork) return

  const { x, y, z } = player.position
  const playerPosition = new mp.Vector3(x, y, z)

  const isOnWorkPlace = workPlace.shape.isPointWithin(playerPosition)
  if (!isOnWorkPlace) return

  player.call('startWorkAnimation')
  await new Promise((res) => setTimeout(res, 26000))

  const salary = 500
  addSalary(player, salary)
  removeWorkPlace(player)

  createWorkPlace(player, workPlace)
})

mp.events.addCommand('test', (player) => {
  player.call('addSalary', [500])
})
