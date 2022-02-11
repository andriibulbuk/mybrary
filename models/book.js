const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  publishDate: {
    type: Date,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
  description: String,
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  coverImageType: {
    type: String,
    required: true,
  },
  coverImage: {
    type: Buffer,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Author"
  },
})

bookSchema.virtual('coverImagePath').get(function() {
  if (this.coverImage && this.coverImageType) {
    return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`;
  }
});

bookSchema.virtual('publishDateToShow').get(function () {
  if (this.publishDate) {
    return this.publishDate.toISOString().split('T')[0];
  }
});

module.exports = mongoose.model('Book', bookSchema);
