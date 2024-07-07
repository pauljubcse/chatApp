const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   tokens: [
//     {
//       token: {
//         type: String,
//         required: true
//       }
//     }
//   ]
// })

//const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  userId: {
    type: Number,
    unique: true
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ]
})

// Pre-save middleware to generate and set the userId
userSchema.pre('save', async function (next) {
  const user = this
  if (!user.userId) {
    // Generate the userId if it doesn't exist
    const lastUser = await mongoose
      .model('User', userSchema)
      .findOne({}, {}, { sort: { userId: -1 } })
    user.userId = lastUser && lastUser.userId ? lastUser.userId + 1 : 1
  }
  next()
})

//const User = mongoose.model('User', userSchema);

//module.exports = User;

userSchema.methods.verifyPassword = async function (password) {
  const user = this
  const isMatch = await bcrypt.compare(password, user.password)
  return isMatch
}

const User = mongoose.model('User', userSchema)

module.exports = User
