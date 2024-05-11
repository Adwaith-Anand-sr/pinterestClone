const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
   },
   createdAt: {
      type: Date,
      default: Date.now
   },
   posts: String,
   caption: String,
   location: String,
   mentions :[
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "user"
      }
   ],
   likes :[
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "user"
      }
   ]
})

module.exports = mongoose.model('post', postSchema)
