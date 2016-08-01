var express = require('express')
, router = express.Router()
, app = require('../app')
, request = require('request')
, fs  = require("fs")
, _ = require('lodash');


require('dotenv').config(); // need it here for tests to pass

/* GET home page. */

router.get('/', function(req, res) {
    console.log(req.headers['accept-language'].match(/[^;]*/)[0]);
    res.render('index', { title: 'SOFTSKY Site Security' });
});

router.post('/quickScan', function(req, res) {
    console.log(req.body.fields);
    var ldf = _(req.body.fields),
	name = ldf.values()[0],
	website = ldf.values()[1],
	email = ldf.values()[2],
	phone = ldf.values()[3],
	languages = req.headers['accept-language'].split(';')[0].split(',');

    // trying to determine language we will use
    var lang = _(JSON.parse(process.env.SUPPORTED_LANGUAGES)).intersection(languages);

    if(lang.length){
	// if intersection found
	lang = lang[0];
    } else {
	// if not, english is used by default
	lang = 'en';
    }

    console.log(lang);

    var user = {name: name, email: email, website: website, phone: phone, lang: lang},
	tmpl = `emails/${lang}/report-is-generating`;

    console.log(user);

    var matches = fs.readFileSync(`views/${tmpl}.jade`).toString().match(/title (.*)/);
    // sending mail
    request.post('http://localhost:3000/api/mailTo', {form: _.extend(user, {
	template: tmpl,
	to: email, // REQUIRED. This can be a comma delimited string just like a normal email to field.
	subject: matches && matches.length?matches[1]:''
    })}, (error, response, body) => {
	request.post('http://localhost:3000/api/quickScan', {form: _.extend(user, {
	})}, (error, response, body) => {
	    res.status(200).send(JSON.stringify(body));
	});
    });

});


module.exports = router;
