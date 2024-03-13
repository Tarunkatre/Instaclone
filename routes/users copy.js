var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Insta')

const userSchema = mongoose.Schema({
  name: String,
  username: String,
  password: String,
  email: String,
  posts:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post'
  }],
  stories:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'story'
  }],
  followers:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  following:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  pic:{
    type: String,
    default: 'default.jpg'
  },
  bio: String
  
})

userSchema.plugin(plm);
module.exports = mongoose.model('user',userSchema)
