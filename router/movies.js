const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');

const movieController = require('../controller/movieController');

//index;
router.get('/', movieController.index);

router.post('/:id', movieController.starReview);

router.post('/movies', upload.single('image'), movieController.reviewStore);

//show;
router.get('/:id', movieController.show);

module.exports = router;