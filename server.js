const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = socketio(server)

//set static folder
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatOn Bot'

//Run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({username, roomId}) => {
    const user = userJoin(socket.id, username, roomId)

    socket.join(user.roomId)

    // Welcome current user 
    socket.emit('message', formatMessage(botName, 'Welcome to ChatOn!'))

    // Broadcast when a user connects
    socket.broadcast.to(user.roomId).emit('message', formatMessage(botName, `${user.username} has joined the chat`))

    // Send users and room info
    io.to(user.roomId).emit('roomUsers', {
      roomId: user.roomId,
      users: getRoomUsers(user.roomId)
    })
  })

  //Listen for chatMessage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id)

    io.to(user.roomId).emit('message', formatMessage(user.username, msg))
  })

  // Runs when a client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)

    if(user){
      io.to(user.roomId).emit('message', formatMessage(botName, `${user.username} has left the chat`))

      // Send users and room info
      io.to(user.roomId).emit('roomUsers', {
        roomId: user.roomId,
        users: getRoomUsers(user.roomId)
      })
    }
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})