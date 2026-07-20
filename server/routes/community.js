const express = require('express');
const router = express.Router();
require('dotenv').config();
const { getPosts, createPost, likePost, addComment } = require('../controllers/communityController');
const auth = require('../middleware/auth');

router.get('/posts', getPosts);
router.post('/posts', auth, createPost);
router.post('/posts/:id/like', auth, likePost);
router.post('/posts/:id/comments', auth, addComment);

module.exports = router;
