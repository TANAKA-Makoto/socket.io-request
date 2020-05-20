var io = require('socket.io-client')('http://localhost:3123')

io.on('connect', () => console.log('connect!'))
io.on('disconnect', () => console.log('disconnect!'))

io.once('connect', function () {
  process.stdin.on('data', async function (data) {
    try {
      //const res = await ioreq(io).request('toUpper', data.toString().trim())
      io.emit('testEvent', data.toString().trim(),res=>{
        console.log(res)
      })
      
    } catch (err) {
      console.error(err.stack || err)
    }
  })
})
