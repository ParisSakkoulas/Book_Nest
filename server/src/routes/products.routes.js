// book routes



// routes/book.routes.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = file.originalname.split('.').pop()
        cb(null, `${uniqueSuffix}.${ext}`)
    }
})
const upload = multer({ storage: storage })





//Admin routes
router.post('/', authenticateToken, requireAdmin, upload.single('image'), bookController.createBook);
router.delete('/:bookId', authenticateToken, requireAdmin, bookController.deleteBook);
router.put('/:bookId', authenticateToken, upload.single('image'), requireAdmin, bookController.updateBook);


// Public routes
router.get('/:bookId', bookController.getBookById);
router.get('/', bookController.getBooks);





// Protected routes (admin only)
/*

router.put('/:id', protect, auth bookController.updateBook);
router.patch('/:id/stock', protect, authorize('ADMIN'), bookController.updateBookStock);
*/
module.exports = router;


