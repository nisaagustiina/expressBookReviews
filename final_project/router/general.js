const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      return res.status(404).json({ message: `User ${username} is already exists!` });
    } else {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: 'User successfully registered. Now you can login' });
    }
  }

  return res.status(404).json({ message: 'Unable to register user!' });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const allBooks = await Promise.resolve(books);

    return res.status(200).send(JSON.stringify({ books: allBooks }, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;

    const book = await Promise.resolve(books[isbn]);

    if (!book) {
      return res.status(404).json({ message: `No books found for isbn: ${isbn}` });
    }

    return res.status(200).json(book);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;

    const filteredAuthor = await Promise.resolve(Object.values(books).filter(
      book => book.author?.toLowerCase() === author.toLowerCase()
    ));

    if (filteredAuthor.length === 0) {
      return res.status(404).json({ "message": `No books found for author: ${author}` });
    }

    return res.status(200).json(filteredAuthor);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" })
  }

});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title.toLowerCase();
    const result = [];

    for (let isbn in books) {
      const book = books[isbn];
      if (book.title && book.title.toLowerCase() === title) {
        result.push({
          isbn: isbn,
          author: book.author,
          title: book.title,
          reviews: book.reviews
        });
      }
    }

    if (result.length === 0) {
      return res.status(404).json({ "message": `No books found for title: ${title}` });
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: `No book found for isbn: ${isbn}`
    });
  }

  return res.status(200).json(book.reviews || {});
})

module.exports.general = public_users;
