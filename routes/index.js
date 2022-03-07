const express = require('express');
const router = express.Router();
const Book = require('../models/book');

router.get('/', async (req, res) => {
  let books;
  try {
    books = await Book.find().sort({ createAt: 'desc' }).limit(15).populate('author').exec();
    res.render('index', { books: books });
  } catch(error) {
    books = [];
  }
});

module.exports = router;