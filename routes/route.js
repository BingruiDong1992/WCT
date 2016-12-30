var express = require('express');
var path = require('path');
var router = express.Router();
var termId;

router.get('/', function(req, res) {
    res.render('index');
});

// router.get('/wct', ensureAuthenticated, function(req, res) {
//     //res.render(path.resolve('views/wct.handlebars'));
//     res.render('wct', {layout: false});
// });

router.get('/wcts/:id', ensureAuthenticated, function(req, res) {
    res.render('wct', {layout: false});
});

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    else {
        req.flash('error', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;