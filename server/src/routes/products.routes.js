// book routes



// routes/book.routes.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');





//Admin routes
router.post('/', authenticateToken, requireAdmin, bookController.createBook);
router.delete('/:bookId', authenticateToken, requireAdmin, bookController.deleteBook);
router.put('/:bookId', authenticateToken, requireAdmin, bookController.updateBook);


// Public routes
router.get('/:bookId', bookController.getBookById);
router.get('/', bookController.getBooks);





// Protected routes (admin only)
/*

router.put('/:id', protect, auth bookController.updateBook);
router.patch('/:id/stock', protect, authorize('ADMIN'), bookController.updateBookStock);
*/
module.exports = router;


