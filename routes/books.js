const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

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
    const books = await query.populate('author').exec();
    res.render('books/index', {
      searchOptions: req.query,
      books: books,
    });
  } catch (error) {
    res.redirect('/');
  }

});

router.get('/new', async (req, res) => {
  renderNewPage(res, new Book());
});

router.post('/', async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });
  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    res.redirect('books');
  } catch (error) {
    renderNewPage(res, book, true)
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author');
    res.render('books/book', { book: book });
  } catch (error) {
    res.redirect('/books');
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author');
    const authors = await Author.find();
    res.render('books/edit', { 
      book: book, 
      authors: authors,
    });
  } catch (error) {
    res.redirect(`/books`);
  }
});

router.put('/:id', async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    updateBook(book, req.body);
    await book.save();
    res.redirect(`/books/${req.params.id}`);
  } catch (error) {
    if (!book) {
      res.redirect('/');
    }

    renderUpdatePage(res, book, true);
  };
});

router.delete('/:id', async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect('/books');
  } catch (error) {
    if (!book) {
      res.redirect('/');
    }
    res.render('/books/book', {
      book: book,
      errorMessage: 'Error deleting book',
    });
  }
});

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, 'new', book, hasError);
}

async function renderUpdatePage(res, book, hasError = false) {
  renderFormPage(res, 'edit', book, hasError)
}

async function renderFormPage(res, form, book, hasError) {
  try {
    const authors = await Author.find();
    const params = {
      authors: authors,
      book: book
    }
  
    if (form === 'new' && hasError) {
      params.errorMessage = 'Error Creating Book';
    } else if (form === 'edit' && hasError) {
      params.errorMessage = 'Error Updating Book';
    }

    res.render(`books/${form}`, params);
  } catch {
    res.redirect('/books');
  }
}

function saveCover(book, coverEncoded) {
  if (!coverEncoded) {
    return;
  }

  const cover = JSON.parse(coverEncoded);
  
  if (cover && imageMimeTypes.includes(cover.type)) {
    book.coverImage = Buffer.from(cover.data, 'base64');
    book.coverImageType = cover.type;
  }
}

function updateBook(book, reqBody) {
  const keys = Object.keys(reqBody);

  keys.forEach(key => {
    if (key === 'cover' && reqBody[key]) {
      saveCover(book, reqBody[key]);
    } else if (reqBody[key]) {
      book[key] = reqBody[key];
    }
    book.updatedAt = Date.now();
  });
}

module.exports = router;
