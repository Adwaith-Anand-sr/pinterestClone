const mongoose = require("mongoose");

const postschema= mongoose.Schema({
   postName: {
      type: String,
      required: true
   },
   image: String,
   user :{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   },
   username :String,
   date:{
      type: Date,
      default: Date.now
   },
   likes:{
      type: Array,
      default: []
   }
})

module.exports = mongoose.model("post",postschema );