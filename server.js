const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const db = require('./server/config/db');
const sql = require('mssql');
const routes = require('./routes');
const app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
// Passport configuration
require('./auth');

const port = process.env.port || 8090;
const router = express.Router();

router.use(function (req, res, next) {
    // do logging 
    // do authentication 
    console.log('Logging of request will be done here');
    next(); // make sure we go to the next routes and don't stop here
});

app.post('/oauth/token', routes.oauth2.token);

router.get('/bills', 
    passport.authenticate('bearer', { session : false }),
    function (req, res) {    
    db.pool.connect(err => {
        if(err) console.log(err);
        var request = new sql.Request(db.pool);
        request.input('scenarioID', sql.Int, req.query['scenarioId']);
		request.input('proID', sql.Int, req.query['proId']);
        request.execute('dbo.uspGetAllShipments', (err, result) => {
            if(err) console.log(err);
            res.send(result);
            db.pool.close();
        });
    });    
});

app.use('/api', router);
app.listen(port);
console.log('Rest API is running at ' + port);