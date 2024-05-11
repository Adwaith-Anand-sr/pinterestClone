const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
   username: {
      type: String,
      required: true,
      unique: true
   },
   fullname: String,
   password: String,
   email: String,
   gender: String,
   createdAt: {
      type: Date,
      default: Date.now
   },
   followers: {
      type: Number,
      default: 0
   },
   followings: {
      type: Number,
      default: 0
   },
   posts: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "post"
      }
   ],
   verified: Boolean,
   dp: {
      type: String,
      default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJW3vgacBtVdCZxUEgolubXOXHaIwJtqt_UIfQcIfB-w&s"
   },
   cover: {
      type: String,
      default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJW3vgacBtVdCZxUEgolubXOXHaIwJtqt_UIfQcIfB-w&s"
   }
})

module.exports = mongoose.model('user', userSchema)
