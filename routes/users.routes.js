const user = require('../controllers/user.controller');
const express = require('express');
const router = express.Router();
const passport = require('passport');

module.exports = router;

router.get('/register', user.signup);
router.post('/register', user.authenticateUser);
router.get('/login', user.login);
router.post('/login', passport.authenticate('local', { 
    failureRedirect: '/login',
    failureFlash: true 
}),
    function(request, response) {
        response.render('home');
});
router.get('/home', user.home);
router.get('/logout', user.logout);
router.post('/:user/update', user.updateUser);
router.delete('/:user/delete', user.deleteUser);
router.get('/users', user.showAllUsers);
router.get('/:user/posts', user.showPosts);
router.get('/profile',user.showUserProfile);
