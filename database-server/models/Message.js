const mongoose = require('mongoose')

// Define the Message schema
const messageSchema = new mongoose.Schema({
  fromID: {
    type: String,
    required: true,
    ref: 'User' // Assuming you have a 'User' model, replace it with the actual model name if needed
  },
  toID: {
    type: String,
    required: true,
    ref: 'User' // Assuming you have a 'User' model, replace it with the actual model name if needed
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

// Create the Message model
const Message = mongoose.model('Message', messageSchema)

module.exports = Message
