#!/bin/env node

var express = require('express');
var ejs = require('ejs');
var http = require('http');
var path = require('path');
var moment = require('moment');

moment().format();

var SIApp = function() {

	var self = this;

    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = (process.env.VCAP_APP_HOST || 'localhost');
        self.port      = (process.env.VCAP_APP_PORT || 3000);

        if (typeof self.ipaddress === "undefined") {
            //  Log errors but continue w/ 127.0.0.1
            console.warn('No internal IP variable, using 127.0.0.1 (localhost)');
            self.ipaddress = "127.0.0.1";
        }
    };

	self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating app \'golfbmpsolutions\'...',
                       moment(), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', moment() );
    };

    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

	self.createRoutes = function() {
		self.get_routes = {};
		self.get_routes['/*'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html; charset=utf8');
            var url = req.url;
            if(url == "/") {
	            res.render('home');
	        } else if(url == "/sustainable") {
	        	res.render("sustainable");
        	} else if(url == "/benefits") {
	        	res.render("benefits");
    		} else if(url == "/involvement") {
	        	res.render("involvement");
    		} else if(url == "/contact") {
	        	res.render("contact");
	        } else {
	        	res.redirect("/");
	        }
        }
    }

	self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.app.engine('ejs', require('ejs-locals'));
        self.app.set('view engine', 'ejs');
        self.app.set('view options', { layout: "boilerplate" });
        self.app.set('views', __dirname + '/templates');
        self.app.use(express.bodyParser());
        self.app.use(express.methodOverride());
        self.app.use(express.compress());
        self.app.use(express.favicon( __dirname + '/favicon.ico'));
        self.app.use(express.static(path.join(__dirname, 'public')));
        self.app.get('/*', self.get_routes['/*']);
    }


	self.initialize = function() {
		self.setupVariables();
		self.createRoutes();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };

    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        moment(), self.ipaddress, self.port);
        });
    };

}

var app = new SIApp();
app.initialize();

app.start();