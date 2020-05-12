const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  pictureUrl: {
    type: String,
  },
  title: {
    type: String,
  },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
