const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

router.get('/', async (req, res) => {
  let searchOptions = {}

  if (req.query.name) {
    searchOptions.name = new RegExp(req.query.name, 'i');
  }

  try {
    const authors = await Author.find(searchOptions);
    res.render('authors/index', {
      authors: authors,
      searchOptions: req.query,
    });
  } catch (error) {
    res.redirect('/');
  }

});

router.get('/new', (req, res) => {
  res.render('authors/new', { author: new Author() });
});

router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name,
  })

  try {
    const newAuthor = await author.save();
    res.redirect('authors');
  } catch (error) {
    res.render('authors/new', {
      author: author,
      errorMessage: "Error creating Author"
    })
  }
});

router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const booksByAuthor = await Book.find({ author: author.id }).limit(6).exec();

    res.render('authors/author', { 
      author: author,
      booksByAuthor: booksByAuthor,
     });
  } catch (error) {
    res.render('authors');
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render('authors/edit', { author: author });
  } catch (error) {
    res.render('authors');
  }
});

router.put('/:id', async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author.id}`);
  } catch (error) {
    if (!author) {
      res.redirect('/')
    }
    res.render('authors/edit', {
      author: author,
      errorMessage: 'Error updating Author'
    });
  }
});

router.delete('/:id', async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect('/authors');
  } catch (error) {
    if (!author) {
      res.redirect('/')
    }
    res.redirect(`/authors/${author.id}`);
  }
});

module.exports = router;