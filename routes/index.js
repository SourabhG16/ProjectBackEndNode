var express = require('express');
var router = express.Router();
var userController  = require('../bin/controllers/controller/user-controller');
var passport	    = require('passport');
//require('../bin/controllers/middleware/passport')(passport)
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var config      = require('../bin/controllers/config/config');
router.use(passport.initialize());
/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/
//var MongoClient = require('mongodb').MongoClient,format=require('util').format;
//Create a database named "ClientDB":
mongoose.connect(config.db, { useNewUrlParser: true , useCreateIndex: true});

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
});
connection.on('error', (err) => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    process.exit();
});
 
/* 
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("ClientDB");
  dbo.createCollection("customers", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
});
*/
/*const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
});

connection.on('error', (err) => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    process.exit();
});*/
router.post('/',function(req,res,next)
{
  console.log(req.body);
  var msg='Loud and clear';
  res.json(msg);
  res.end();
});
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/login/searchdest', userController.searchDest);
router.post('/login/triprecord', userController.tripRecord);
router.post('/login/findstation', userController.findStation);
router.post('/login/transaction', userController.Transaction);
router.post('/login/tripduration', userController.tripDuration);
router.get('/special', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.json({ msg: `Hey ${req.user.email}! I open at the close.` });
});
//console.log(server.address.PORT);
//app.listen(8080);
module.exports = router;
