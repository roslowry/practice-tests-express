const Book = require('./models/book');
const Author = require('./models/author');
const bluebird = require('bluebird')
const Chapter = require('./models/chapter');
const express = require('express');
var app = express();
const morgan = require('morgan');
const path = require('path');
// const routes = require('./routes');
const bodyParser = require('body-parser');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/files', express.static(path.join(__dirname, '/public/static')));
//
app.get('/api/books', function (req, res, next) {
  if (req.query.title) {
    Book.findAll({ where: {
      title: req.query.title
    }
  })
  .then(result => {
    res.status(200).json(result)
  })

  } else {
    Book.findAll()
    .then(books => {
      res.send(books)
    })
  }

});


app.put('/api/books/:bookId', function(req, res, next){
  // res.status(200)
  let bookId = parseInt(req.params.bookId);
  if (typeof bookId !== "number") {
    const err = new Error(500);
    next(err)
  } else {
    Book.findById(bookId)
    .then(function(foundBook){
      if (!foundBook){
        const err = new Error(404);
        next(err);
      } else {
        foundBook.update({
          title: req.body.title
        })
        .then(function (updatedBook){
          res.status(200).send(updatedBook)
        })
      }
     })
    .catch(next)
  }

})


app.post('/api/books', function (req, res, next) {
  let bookToAdd = req.body;
  // console.log('book', bookToAdd);
  // console.log('put is registering', bookToAdd.title === req.body.title)
  Book.create({
    title: bookToAdd.title,
    id: bookToAdd.id
  })
  .then(book => {
    res.status(201).send(book)
  })
  .catch(next)
});
//
app.get('/api/books/:bookId', function (req, res, next) {
  const bookId = parseInt(req.params.bookId);
  if (typeof bookId !== "number") {
    const err = new Error(500);
    next(err)
  } else {
    Book.findById(bookId)
    .then(retrievedBook => {
    if (!retrievedBook) {
      const err = new Error(404);
      next(err);
    }
    res.status(200).send(retrievedBook);
  })
  .catch(next)
  }
});



app.delete('/api/books/:bookId', function (req, res, next ){
  const bookToDelete = parseInt(req.params.bookId);
  // console.log('whatkindwhatkind', bookToDelete, typeof bookToDelete)
  if (!bookToDelete) {
    res.status(500).end()
  } else {
    Book.destroy({
      where: {
        id: bookToDelete
      }
    })
    .then(function(book){
      if (!book) {
        res.status(404).end()
      } else {
        res.status(204).end()
      }
    })
  }
})

app.get('/broken', function(req, res, next) {
  var err = new Error(500);
  next(err);
});

app.get('/forbidden', function(req, res, next){
  var err = new Error('Error was thrown because...');
  err.status = 403
  next(err)
});

app.use(function (err, req, res, next) {
  console.log('error is', err)
  res.status(err.message).send(err)
});

module.exports = app;
