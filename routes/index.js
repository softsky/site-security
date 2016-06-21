var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { title: 'SOFTSKY Site Security' });
});

module.exports = router;
