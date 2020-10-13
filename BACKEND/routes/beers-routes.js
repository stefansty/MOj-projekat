const express = require('express');
const { check } = require('express-validator');

const beersController =require('../controllers/beerscontroller');


const router = express.Router();


router.get('/:bid', beersController.getBeerById );

router.get('/user/:uid', beersController.getBeersByUserId );

router.post('/',[ check('beer')
.not().isEmpty(),
check('description')
.isLength({min: 5}),
check('origin')
.not()
.isEmpty()
], beersController.createBeer);

router.patch(
    '/:bid',
    [
      check('beer')
        .not()
        .isEmpty(),
      check('description').isLength({ min: 5 }),
      check('origin').not().isEmpty()
    ],
    beersController.updateBeer
  );

router.delete('/:bid', beersController.deleteBeer);

module.exports = router;