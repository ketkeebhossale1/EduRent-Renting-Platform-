const { createBook, getBooks } = require('../models/bookModel');

const addBook = async (req, res) => {
  try {
    const { title, author, genre, description } = req.body;
    const user_id = req.user.id;

    const missing = [];
    if (!title) missing.push('title');
    if (!author) missing.push('author');
    if (!genre) missing.push('genre');
    if (!description) missing.push('description');

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}.`,
      });
    }

    if (title.trim().length === 0 || author.trim().length === 0 ||
        genre.trim().length === 0 || description.trim().length === 0) {
      return res.status(400).json({ error: 'Fields cannot be blank.' });
    }

    const book = await createBook({
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      description: description.trim(),
      user_id,
    });

    return res.status(201).json({
      message: 'Book added successfully.',
      book,
    });
  } catch (err) {
    console.error('Add book error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const listBooks = async (req, res) => {
  try {
    const { author, genre } = req.query;
    const books = await getBooks({ author, genre });

    return res.status(200).json({
      count: books.length,
      books,
    });
  } catch (err) {
    console.error('List books error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { addBook, listBooks };
