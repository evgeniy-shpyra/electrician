mp.events.addCommand('pos', (player) => {
  console.log(player.position)
})

mp.events.addCommand('move', (player) => {
  player.position = new mp.Vector3(722.22, 138.37, 80.75)
})

mp.events.addCommand('kill', (player) => {
  player.health = 0
})
