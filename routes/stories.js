var mongoose = require('mongoose');

const storySchema = mongoose.Schema({
  caption: String,
  pic: String,
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  likes:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }], 
  date: {
    type: Date,
    default: Date.now
  }
  
})

module.exports = mongoose.model('story',storySchema)
