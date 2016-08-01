var express = require('express')
, router = express.Router()
, fs  = require("fs")
, mailer = require('express-mailer');

/* GET users listing. */
router.get('/', function(req, res) {
    res.send('respond with a resource');
});

router.post('/quickScan', (req, res) => {
    const exec = require('child_process').exec;
    const async = require('async');

    const website = req.body.website;
    const domain = require('url').parse(website).hostname;

    const commands = [
	`docker exec -t elegant_liskov nikto -C none -timeout 1 -output /tmp/reports/$host/nikto.html -host $url`, // nikto
	`docker exec -t elegant_liskov nmap -sS -sV --script vuln -oX /tmp/reports/$host/nmap.xml $host;docker exec -t elegant_liskov xsltproc /tmp/reports/$host/nmap.xml -o /tmp/reports/$host/nmap.html`, // nmap
    ];

    exec('docker exec -t elegant_liskov mkdir -p /tmp/reports/$host', {
	env: {
	    host: domain,
	    url: website
	}
    }, (error, stdout, stderr) => {
	if (error) {
	    console.error(`exec error: ${error}`);
	    return;
	}
	console.log(`stdout: ${stdout}`);
	console.log(`stderr: ${stderr}`);

	async.eachOfLimit(commands, 5, (command, index, cb) => {
	    console.log(`Executing: ${command}`);
	    exec(command,{
		env: {
		    host: domain,
		    url: website
		}
	    }, (error, stdout, stderr) => {
		if (error) {
		    console.error(`exec error: ${error}`);
		    cb();
		    return;
		}
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
		cb();
	    });
	}, () => {
	    console.log('All done');
	    res.status(200).send(JSON.stringify({status:"OK"}));
	});


    });
});

router.post('/mailTo', (req, res) => {
    console.log(req.body);
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
