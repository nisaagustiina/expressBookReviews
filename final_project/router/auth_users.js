const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  const u = users.filter((user) => user.username === username);
  return u.length > 0 ? false : true;
}

const authenticatedUser = (username, password) => {
  const validUser = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  return validUser.length > 0 ? true : false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in!" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!review) {
    return res.status(400).json({ message: "Review query is required" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: `No books found for isbn: ${isbn}` });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;

  return res.status(200).json({ message: `Review from ${username} added successfully` });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  const book = books[isbn];

  if (!book || !book.reviews) {
    return res.status(404).json({ message: "No review found" });
  }

  if (!book.reviews[username]) {
    return res.status(404).json({
      message: "User has no review for this book"
    });
  }

  delete book.reviews[username];

  return res.status(200).json({ message: `Review from ${username} deleted successfully` });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
