const mongoose = require("mongoose");
const dbName = "pinterest-db"
const url = `mongodb+srv://sreeadwa:adwaith6574@cluster0.dubqcyd.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
const plm = require("passport-local-mongoose");

mongoose.connect(url).then(()=>{
   console.log("connected to database");
})
.catch((err)=>{
   console.log(`${err}`);
})

const userschema =mongoose.Schema({
   username: { 
      type: String,
      unique: true
   },
   password :{ 
      type: String
   },
   post: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "post"
   }],
   dp: String,
   email:{
      type: String,
      required: true
   }
})

userschema.plugin(plm);
module.exports = mongoose.model("User", userschema);