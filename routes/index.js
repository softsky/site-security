var express = require('express')
, router = express.Router()
, mailer = require('express-mailer')
, app = require('../app')
, request = require('request')
, _ = require('lodash');


require('dotenv').config(); // need it here for tests to pass

/* GET home page. */

router.get('/', function(req, res) {
    console.log(req.headers['accept-language'].match(/[^;]*/)[0]);
    res.render('index', { title: 'SOFTSKY Site Security' });
});

router.post('/quickScan', function(req, res) {
    //console.log(req);
    // sending mail
    request.post('http://localhost:3000/mailTo', {form: _.extend(req.body, {
	template: 'emails/ua/report-is-generating',
    	to: req.body.email, // REQUIRED. This can be a comma delimited string just like a normal email to field.
    	subject: 'Дякуємо за заявку. Ваш звіт генерується' // REQUIRED.
    })}, (error, response, body) => {
    	res.status(200).send(JSON.stringify(body));
    });
});

router.post('/mailTo', (req, res) => {
    // FIXME probably migrate to SendGrid API or other
    // FIXME: check if connection comes from localhost
    res.mailer.send(req.body.template, req.body, (err, message) => {
	if(err){
	    console.log(err);
	    res.status(200).send(`Problems sending email: ${err}`);
	} else {
	    res.status(200).send(message);
	}
    });
});


module.exports = router;
