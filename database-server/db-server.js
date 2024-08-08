const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const { Kafka } = require('kafkajs')
const Message = require('./models/Message')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const app = express()
const port = 4000

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

// Kafka Consumer Setup
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

const consumer = kafka.consumer({ groupId: 'test-group' }) // Your group ID

const runConsumer = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true }) // Your topic name

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString()
      })

      // Parse the message value to JSON
      const msg = JSON.parse(message.value.toString())

      // Create a new message instance
      const newMessage = new Message({
        fromID: msg.clientChannel,
        toID: msg.targetChannel,
        text: msg.clientMessage
      })

      // Save the message to the database
      await newMessage.save().catch(err => {
        console.error('Error saving message from Kafka:', err)
      })
    }
  })
}

runConsumer().catch(console.error)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
