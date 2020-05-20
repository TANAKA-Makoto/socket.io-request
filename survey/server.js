var io = require('socket.io')(3123)

io.on('connection', function (socket) {
  console.log('new client! ' + socket.id)

  socket.on('testEvent',(req,ack) => {
    console.log('get msg:' + req)
    ack('server get msg :' + req)
  })
})
