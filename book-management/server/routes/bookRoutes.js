const express = require('express');
const router = express.Router();
const { addBook, listBooks } = require('../controllers/bookController');
const authenticate = require('../middleware/auth');

router.post('/', authenticate, addBook);
router.get('/', listBooks);

module.exports = router;
