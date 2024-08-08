const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const { Kafka } = require('kafkajs')
const axios = require('axios')
const Message = require('./models/Message')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const app = express()
const port = 10000

app.use(cors()) // Use CORS middleware to allow requests from the frontend
app.use(bodyParser.json())

// Connect to MongoDB using Mongoose
mongoose
  .connect('mongodb://0.0.0.0:27017/user', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err)
  })

app.get('/test', (req, res) => {
  res.send('LMAO')
})

// Kafka Producer Setup
const kafka = new Kafka({
  clientId: 'my-consumer',
  brokers: ['kafka-2e52c2bd-aryanpauljubcse25-f25d.g.aivencloud.com:11212'], // Your Kafka broker address
  ssl: {
    ca: [
      fs.readFileSync(
        path.resolve(
          'C:/Users/Aryan/Desktop/Code/LABS3.2/IT_LAB/ChatApp/database-server/ca.pem'
        ),
        'utf-8'
      )
    ]
  },
  sasl: {
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
    mechanism: 'plain'
  }
})

const producer = kafka.producer()

const runProducer = async () => {
  await producer.connect()
}

runProducer().catch(console.error)

// Route to handle incoming messages
app.post('/messages', async (req, res) => {
  try {
    const { clientChannel, clientMessage, targetChannel } = req.body

    // Create a new message instance
    const newMessage = new Message({
      fromID: clientChannel,
      toID: targetChannel,
      text: clientMessage
    })

    // Save the message to the database
    await newMessage.save()

    // Produce the message to Kafka
    await producer.send({
      topic: 'test-topic', // Your Kafka topic name
      messages: [{ value: JSON.stringify(req.body) }]
    })

    res.status(201).json({
      message: 'Message received, saved, and sent to Kafka successfully!'
    })
  } catch (error) {
    console.error('Error processing message:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
