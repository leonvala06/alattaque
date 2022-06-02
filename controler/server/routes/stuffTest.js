const express = require('express');
const router = express.Router();
const stuffCtrl = require('../controllers/stuffTest');

router.post('/', stuffCtrl.paust);
router.get('/', stuffCtrl.gait);

module.exports = router;