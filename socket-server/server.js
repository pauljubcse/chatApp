// const express = require('express')
// const http = require('http')
// const socketIO = require('socket.io')
// const axios = require('axios')
// const cors = require('cors')

// const { createClient } = require('ioredis')
// const app = express()
// const server = http.createServer(app)
// const io = socketIO(server)
// app.use(cors())
// const writeServerURL = 'http://localhost:4000/messages'

// const publisher = createClient({
//   password: 'NLCNaXZ2UvcER678uuABqW5Ck9aQH3O3',
//   host: 'redis-15275.c276.us-east-1-2.ec2.redns.redis-cloud.com',
//   port: 15275
// })

// const subscriber = createClient({
//   password: 'NLCNaXZ2UvcER678uuABqW5Ck9aQH3O3',
//   host: 'redis-15275.c276.us-east-1-2.ec2.redns.redis-cloud.com',
//   port: 15275
// })
// console.log(subscriber)
// var interestedChannels = new Map()
// var UserChannelToSocket = new Map()
// function subscriptionUpdate () {
//   for (const x of interestedChannels.keys()) {
//     subscriber.subscribe(x)
//   }
//   console.log('Updated Subscriptions')
// }

// // Serve static files from the public directory
// app.use(express.static('public'))

// // Set up a connection event
// io.on('connection', socket => {
//   console.log('A user connected: ', socket.id)

//   // Handle chat message event
//   socket.on('chat message', msg => {
//     //console.log('Message: ' + msg.clientMessage)
//     //console.log('From:' + msg.clientChannel)
//     //console.log('To:' + msg.targetChannel)

//     //Convert Json to string before publishing

//     var jsonString = JSON.stringify(msg)
//     console.log('Publisher: ', jsonString)
//     //Send to Database write server
//     axios
//       .post(writeServerURL, msg)
//       .then(response => {
//         console.log('Message sent successfully:', response.data)
//       })
//       .catch(error => {
//         console.error('Error sending message:', error.message)
//       })

//     //Send to pub/sub
//     publisher.publish(msg.targetChannel, jsonString, (err, reply) => {
//       if (err) console.log(err)
//       else console.log(reply)
//     })
//     //io.emit('chat message', msg)
//   })

//   //Update interested channel list
//   socket.on('channel info', msg => {
//     console.log('Interested Channels: ' + msg.interestedChannels)
//     UserChannelToSocket.set(msg.interestedChannels[0], socket)
//     msg.interestedChannels.forEach(element => {
//       //console.log(element)
//       if (!interestedChannels.has(element)) {
//         interestedChannels.set(element, 1)
//       } else {
//         var i = interestedChannels.get(element)
//         interestedChannels.set(element, i + 1)
//       }
//     })
//     subscriptionUpdate()
//   })

//   // Handle disconnect event
//   socket.on('disconnect', () => {
//     console.log('User disconnected')
//   })
// })

// // Listen for messages on the subscribed channels
// subscriber.on('message', (channel, message) => {
//   console.log(`Received message from channel ${channel}: ${message}`)
//   // Handle the message as needed
//   message = JSON.parse(message)
//   socket = UserChannelToSocket.get(channel)
//   //console.log(socket)
//   //console.log(socket.id)
//   //Send to interested user
//   io.to(socket.id).emit('chat message', {
//     from: message.clientChannel,
//     message: message.clientMessage,
//     for: channel
//   })
// })

// // Get port from command-line arguments or use default port 3000
// const port = process.argv[2] || 3000

// // Start the server
// server.listen(port, () => {
//   console.log(`Server listening on port ${port}`)

//   // Send POST request to add-server endpoint of load balancing gateway
//   axios
//     .post('http://localhost:3600/add-server', { port })
//     .then(response => {
//       console.log('Server added successfully:', response.data)
//     })
//     .catch(error => {
//       console.error('Error adding server:', error.message)
//     })
// })

// const handleClose = async () => {
//   // Send POST request to delete-server endpoint on server close
//   try {
//     await axios.post('http://localhost:3600/delete-server', { port })
//     console.log('Server deleted successfully')
//   } catch (error) {
//     console.error('Error deleting server:', error.message)
//   }
//   process.exit(0)
// }

// // Listen for the server close event and handle it
// process.on('SIGINT', handleClose)

const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const axios = require('axios')
const cors = require('cors')

const { createClient } = require('ioredis')
const app = express()
const server = http.createServer(app)
const io = socketIO(server)
app.use(cors())
const writeServerURL = 'http://localhost:10000/messages'

const publisher = createClient({
  password: 'NLCNaXZ2UvcER678uuABqW5Ck9aQH3O3',
  host: 'redis-15275.c276.us-east-1-2.ec2.redns.redis-cloud.com',
  port: 15275
})

const subscriber = createClient({
  password: 'NLCNaXZ2UvcER678uuABqW5Ck9aQH3O3',
  host: 'redis-15275.c276.us-east-1-2.ec2.redns.redis-cloud.com',
  port: 15275
})

console.log(subscriber)
var interestedChannels = new Map()
var UserChannelToSocket = new Map()
var SocketToUserChannel = new Map()
var GroupChannelToSockets = new Map()

function subscriptionUpdate () {
  for (const x of interestedChannels.keys()) {
    subscriber.subscribe(x)
  }
  console.log('Updated Subscriptions: ', interestedChannels.keys())
}

// Serve static files from the public directory
app.use(express.static('public'))

// Set up a connection event
io.on('connection', socket => {
  console.log('A user connected: ', socket.id)

  // Handle chat message event
  socket.on('chat message', msg => {
    var jsonString = JSON.stringify(msg)
    console.log('Publisher: ', jsonString)

    // Send to Database write server
    axios
      .post(writeServerURL, msg)
      .then(response => {
        console.log('Message sent successfully:', response.data)
      })
      .catch(error => {
        console.error('Error sending message:', error.message)
      })

    // Send to pub/sub
    publisher.publish(msg.targetChannel, jsonString, (err, reply) => {
      if (err) console.log(err)
      else console.log(reply)
    })
  })

  // Update interested channel list
  socket.on('channel info', msg => {
    console.log('Interested Channels: ' + msg.interestedChannels)
    msg.interestedChannels.forEach(element => {
      if (element.startsWith('group_')) {
        if (!GroupChannelToSockets.has(element)) {
          GroupChannelToSockets.set(element, [])
        }
        GroupChannelToSockets.get(element).push(socket)
      } else {
        UserChannelToSocket.set(element, socket)
        SocketToUserChannel.set(socket.id, element)
      }
      if (!interestedChannels.has(element)) {
        interestedChannels.set(element, 1)
      } else {
        var i = interestedChannels.get(element)
        interestedChannels.set(element, i + 1)
      }
    })
    console.log('Socket to Channel Map: ', SocketToUserChannel)
    subscriptionUpdate()
  })

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected')
    // Remove socket from group channels
    GroupChannelToSockets.forEach((sockets, channel) => {
      const index = sockets.indexOf(socket)
      if (index !== -1) {
        sockets.splice(index, 1)
      }
    })
    // Remove socket from user channels
    UserChannelToSocket.forEach((s, channel) => {
      if (s === socket) {
        UserChannelToSocket.delete(channel)
      }
    })
  })
})

// Listen for messages on the subscribed channels
subscriber.on('message', (channel, message) => {
  console.log(`Received message from channel ${channel}: ${message}`)
  message = JSON.parse(message)

  if (channel.startsWith('group_')) {
    const sockets = GroupChannelToSockets.get(channel) || []
    // console.log(sockets.size)
    // if (sockets.size) {
    //   sockets.delete(UserChannelToSocket[channel])
    // }
    // console.log(sockets.size)
    console.log(`Target channel: ${channel}`)
    console.log(
      `Members of target channel: ${sockets.map(socket => socket.id)}`
    )
    sockets.forEach(socket => {
      console.log(SocketToUserChannel.get(socket.id))
      if (!(SocketToUserChannel.get(socket.id) == message.clientChannel)) {
        socket.emit('chat message', {
          from: message.clientChannel,
          message: message.clientMessage,
          for: channel
        })
      }
    })
  } else {
    const socket = UserChannelToSocket.get(channel)
    if (socket) {
      console.log(`Target channel: ${channel}`)
      console.log(`Member of target channel: ${socket.id}`)
      socket.emit('chat message', {
        from: message.clientChannel,
        message: message.clientMessage,
        for: channel
      })
    }
  }
})

// Get port from command-line arguments or use default port 3000
const port = process.argv[2] || 3000

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`)

  // Send POST request to add-server endpoint of load balancing gateway
  axios
    .post('http://localhost:3600/add-server', { port })
    .then(response => {
      console.log('Server added successfully:', response.data)
    })
    .catch(error => {
      console.error('Error adding server:', error.message)
    })
})

const handleClose = async () => {
  // Send POST request to delete-server endpoint on server close
  try {
    await axios.post('http://localhost:3600/delete-server', { port })
    console.log('Server deleted successfully')
  } catch (error) {
    console.error('Error deleting server:', error.message)
  }
  process.exit(0)
}

// Listen for the server close event and handle it
process.on('SIGINT', handleClose)
