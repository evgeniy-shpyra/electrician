require('./tools/index.js')

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

const markerRadius = 1

// Мітка взяття/звільнення з роботи
const toggleWorkPosition = new mp.Vector3(722.01, 141.19, 79.75)
const toggleWorkShape = mp.colshapes.newSphere(
  toggleWorkPosition.x,
  toggleWorkPosition.y,
  toggleWorkPosition.z + 0.3,
  markerRadius
)
mp.markers.new(1, toggleWorkPosition, 1)

// Мітки місць роботи, ініціалізація
const workPlacesPosition = [
  new mp.Vector3(664.6714477539062, 112.72749328613281, 79.92),
  new mp.Vector3(670.2241821289062, 128.05892944335938, 79.92),
  new mp.Vector3(664.2767944335938, 130.1977996826172, 79.92),
  new mp.Vector3(686.7776489257812, 144.71788024902344, 79.92),
  new mp.Vector3(692.6104736328125, 142.69354248046875, 79.92),
  new mp.Vector3(685.4440307617188, 169.13719177246094, 79.9),
  new mp.Vector3(679.611572265625, 171.16233825683594, 79.9),
  new mp.Vector3(709.9921264648438, 165.68577575683594, 79.7),
  new mp.Vector3(717.9031982421875, 153.10841369628906, 79.7),
  new mp.Vector3(703.252197265625, 119.6226806640625, 79.92),
  new mp.Vector3(709.0304565429688, 117.49996948242188, 79.92),
  new mp.Vector3(703.2955932617188, 102.20745849609375, 79.7),
  new mp.Vector3(697.4491577148438, 104.26578521728516, 79.7),
]
const workPlaces = []

const initWorkerMarkers = () => {
  for (let i = 0; i < workPlacesPosition.length; i++) {
    const position = workPlacesPosition[i]
    const shape = mp.colshapes.newSphere(
      position.x,
      position.y,
      position.z + 0.3,
      markerRadius
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

// Перевірка чи гравець влаштований на роботу
const isPlayerHasJob = (player) => {
  const workPlace = workPlaces.find((w) => w.playerId === player.id)
  return workPlace ? true : false
}

// створення/видаляння міток місць роботи
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

// Взяття/звільнення з роботи
const turnOnJob = (player) => {
  // Зберігання попереднього одягу
  const prevModel = player.model
  const prevTorso = player.getClothes(3)
  const prevAccessories = player.getClothes(8)

  player.setOwnVariable('prevClothes', {
    model: prevModel,
    torso: prevTorso,
    accessories: prevAccessories,
  })

  // Встановлення робочої форми
  player.model = mp.joaat('mp_m_freemode_01')
  player.setClothes(3, 181, 0, 0)
  player.setClothes(8, 181, 0, 0)

  // Оповіщення
  player.outputChatBox(
    '!{00FF00}Вас прийнято на роботу. Робочий день розпочато.'
  )
  player.notify('~g~Вирушайте на першу мiтку')

  player.setOwnVariable('totalSalary', 0)

  // Створення робочого місця
  createWorkPlace(player)
}
const turnOffJob = (player) => {
  // Встановлення попереднього одягу
  const prevClothes = player.getOwnVariable('prevClothes')
  const { model, torso, accessories } = prevClothes

  player.model = model

  if (torso.drawable !== 65535) {
    player.setClothes(3, torso.drawable, torso.texture, torso.palette)
  } else {
    player.setClothes(3, 0, 0, 0)
  }

  if (accessories.drawable !== 65535) {
    player.setClothes(
      8,
      accessories.drawable,
      accessories.texture,
      accessories.palette
    )
  } else {
    player.setClothes(8, 0, 0, 0)
  }

  // Видалення робочого місця
  removeWorkPlace(player)

  // Оповіщення
  player.outputChatBox('!{FF0000}Вас звільнено з роботи.')
}

// Заробітна плата
const addSalary = (player, amount) => {
  // Безпека
  if (amount > 1000) {
    player.outputChatBox('Ви не можете отримати таку велику суму грошей.')
    return
  }

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
  player.call('displayMoney', [newAmount])
}

// Робоча зона
const workZoneCenterPosition = new mp.Vector3(690.0815, 116.4343, 85.8773)
const workZoneRadius = 74
const workZoneShape = mp.colshapes.newSphere(
  workZoneCenterPosition.x,
  workZoneCenterPosition.y,
  workZoneCenterPosition.z,
  workZoneRadius
)
mp.events.add('playerExitColshape', (player, shape) => {
  if (shape != workZoneShape) return
  const isOnJob = isPlayerHasJob(player)
  if (!isOnJob) return

  removeAllSalary(player)
  turnOffJob(player)
})

// Смерть гравця
mp.events.add('playerDeath', (player) => {
  const isOnJob = isPlayerHasJob(player)
  if (isOnJob) {
    removeAllSalary(player)
    turnOffJob(player)
  }
})

// Взяємодія з мітками
mp.events.add('tryHandleMarker', async (player) => {
  const { x, y, z } = player.position
  const playerPosition = new mp.Vector3(x, y, z)
  // Якщо гравець не на тереторії електростанції
  if (!workZoneShape.isPointWithin(playerPosition)) return

  if (toggleWorkShape.isPointWithin(playerPosition)) {
    // Взаємодія з міткою влаштування/звільнення з роботи
    const isOnJob = isPlayerHasJob(player)
    if (isOnJob) {
      turnOffJob(player)
    } else {
      turnOnJob(player)
    }
  } else {
    // Взаємодія з міткою місця роботи
    const indexOfWorkPlace = workPlaces.findIndex(
      (w) => w.playerId === player.id
    )
    if (indexOfWorkPlace < 0) return

    const workPlace = workPlaces[indexOfWorkPlace]
    if (workPlace.isWork) return

    const isOnWorkPlace = workPlace.shape.isPointWithin(playerPosition)
    if (!isOnWorkPlace) return

    workPlace.isWork = true

    player.call('startWorkAnimation')
    await new Promise((res) => setTimeout(res, 26000))

    const salary = 500
    addSalary(player, salary)
    removeWorkPlace(player)

    createWorkPlace(player, workPlace)
  }
})
