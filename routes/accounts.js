const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

router.get('/signout', async (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
})
router.get('/login', async (req, res) => {
    res.render('login', { hide_login: true });
});

router.post('/login', async (req, res) => {
    const username = req.body.username.trim();
    const p1 = req.body.password.trim();
    const user = await req.db.findUserByUsername(username);

    console.log(user);
    if (user && bcrypt.compareSync(p1, user.password)) {
        req.session.user = user;
        res.redirect('/');
        return;
    } else {
        res.render('login', { hide_login: true, message: 'Sign in does not exist' });
        return;
    }
});

router.get('/signup', async (req, res) => {
    res.render('signup', { hide_login: true });
});

router.post('/signup', async (req, res) => {
    const fname = req.body.fname.trim();
    const lname = req.body.lname.trim();
    const username = req.body.username.trim();
    const p1 = req.body.password.trim();
    const p2 = req.body.password2.trim();
    if (p1 != p2) {
        res.render('signup', { hide_login: true, message: 'Passwords do not match!' });
        return;
    }

    const user = await req.db.findUserByUsername(username);
    if (user) {
        res.render('signup', { hide_login: true, message: 'This account already exists!' });
        return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(p1, salt);

    const id = await req.db.createUser(fname, lname, username, hash);
    req.session.user = await req.db.findUserById(id);
    res.redirect('/');
});

module.exports = router;