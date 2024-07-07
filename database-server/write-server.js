const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = 4000

app.use(cors()) // Use CORS middleware to allow requests from the frontend
app.use(bodyParser.json())

//Connect to MongoDB using Mongoose
mongoose
  .connect('mongodb://0.0.0.0:27017/user')
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err)
  })
// Define the Message model
const Message = require('./models/Message')

app.get('/test', (req, res) => {
  res.send('LMAO')
})

// Route to handle incoming messages
app.post('/messages', async (req, res) => {
  try {
    //console.log(req.body)
    const { clientChannel, clientMessage, targetChannel } = req.body
    //console.log(clientChannel)
    // Create a new message instance
    const newMessage = new Message({
      fromID: clientChannel,
      toID: targetChannel,
      text: clientMessage
    })

    // Save the message to the database
    await newMessage.save()

    res
      .status(201)
      .json({ message: 'Message received and saved successfully!' })
  } catch (error) {
    console.error('Error saving message:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
