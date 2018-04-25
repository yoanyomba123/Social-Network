const post = require('../controllers/post.controller');
const express = require('express');
const router = express.Router();
const passport = require('passport');

module.exports = router;

router.post('/post/add', post.processPost);
