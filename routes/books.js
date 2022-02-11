const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Book = require('../models/book');
const uploadPath = path.join('public', Book.coverImageBasePath);
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  }
});

router.get('/', async (req, res) => {
  let query = Book.find();

  if (req.query.title) {
    query = query.regex('title', new RegExp(req.query.title, 'i'));
  }

  if (req.query.publishedBefore) {
    query = query.lte('publishDate', req.query.publishedBefore)
  }

  if (req.query.publishedAfter) {
    query = query.gte('publishDate', req.query.publishedAfter)
  }

  try {
    const books = await query.exec();
    res.render('books/index', { 
      searchOptions: req.query,
      books: books
    });
  } catch (error) {
    res.redirect('/');
  }

});

router.get('/new', async (req, res) => {
  renderNewPage(res, new Book());
});

router.post('/', upload.single('cover'), async (req, res) => {
  const fileName = req.file ? req.file.filename : null;
  console.log();
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description,
  })

  try {
    const newBook = await book.save();
    res.redirect('books');
  } catch (error) {
    console.log(error);
    if (book.coverImageName) {
      removeBookCover(book.coverImageName);
    }
    renderNewPage(res, book, true)
  }
});

function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), (error) => {
    if (error) {
      console.error(error);
    }
  })
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find();
    const params = {
      authors: authors,
      book: book
    }

    if (hasError) {
      params.errorMessage = "Error Creating Book";
    }
  
    res.render('books/new', params);
  } catch {
    res.redirect('/books');
  }
}

module.exports = router;