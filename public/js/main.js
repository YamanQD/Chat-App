const chatForm = document.getElementById('chat-form')
const chatMessages =  document.querySelector('.messages')
const roomName = document.getElementById('roomId')
const userList = document.getElementById('users')

// Get username and room-id from URl
const username = Qs.parse(location.search, {ignoreQueryPrefix: true}).username
const roomId = Qs.parse(location.search, {ignoreQueryPrefix: true}).roomId || 'main'

const socket = io();

// Join chat room
socket.emit('joinRoom', {username, roomId})

// Get room and users
socket.on('roomUsers', ({roomId, users}) => {
  outputRoomId(roomId)
  outputUsers(users)
})

// Message from server
socket.on('message', (message) => {
  outputMessage(message)

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault()

  // Get message text
  const msg = e.target.elements.msg.value

  // Emit a message to server
  socket.emit('chatMessage', msg)  

  // Clear input
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus() 
})

// Add messsage to DOM
const outputMessage = (message) => {
  time = moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('h:mm a')

  const li = document.createElement('li')
  if(message.username === username){
    li.classList.add('d-flex', 'justify-content-end', 'w-100', 'my-3', 'message')
    li.style.paddingRight = '16px'
    li.innerHTML = `<small class="time">${time}</small><div class="speech-bubble-right p-2">${message.text}</div>`
  } else {
    li.classList.add('d-flex', 'justify-content-begin', 'w-100', 'my-3', 'message')
    li.style.paddingLeft = '16px'
    if(message.username === 'ChatOn Bot') {
      li.innerHTML = `<div class="speech-bubble-left p-2"><span class="sender-name">${message.username}</span><span style="color:#3EC300;">${message.text}</span></div><small class="time">${time}</small>`
    } else {
      li.innerHTML = `<div class="speech-bubble-left p-2"><span class="sender-name">${message.username}</span>${message.text}</div><small class="time">${time}</small>`
    }
  }
  document.querySelector('.messages').appendChild(li)
}

// Add roomId to DOM
const outputRoomId = (roomId) => {
  roomName.innerText = roomId
}

// Add users to DOM
const outputUsers = (users) => {
  userList.innerHTML = `
    ${users.map(user => `<li class="list-group-item d-flex align-items-center"><img src="./assets/blank-profile-picture.png" alt="user" width="60px" height="60px" class="rounded-circle"><span class="flex-fill text-center username">${user.username}</span></li>`).join('')}
  `
}
