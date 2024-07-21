mp.events.addCommand('pos', (player) => {
  console.log(player.position)
})

mp.events.addCommand('move', (player) => {
  player.position = new mp.Vector3(741, 132.6, 80)
})

mp.events.addCommand('kill', (player) => {
  player.health = 0
})

