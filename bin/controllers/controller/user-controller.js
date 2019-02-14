var User = require('../models/user');
var jwt = require('jsonwebtoken');
var config = require('../config/config');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
function createToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
        expiresIn: 2000 // 86400 expires in 24 hours
      });
}

exports.registerUser = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ 'msg': 'You need to send email and password' });
    }

    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            return res.status(400).json({ 'msg': err });
        }

        if (user) {
            return res.status(400).json({ 'msg': 'The user already exists' });
        }

        let newUser = User(req.body);
        newUser.save((err, user) => {
            if (err) {
                return res.status(400).json({ 'msg': err });
            }
            return res.status(201).json(user);
        });
    });
};
exports.loginUser = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({ 'msg': 'You need to send email and password' });
    }

    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            return res.status(400).send({ 'msg': err });
        }

        if (!user) {
            return res.status(400).json({ 'msg': 'The user does not exist' });
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (isMatch && !err) {
                return res.status(200).json({
                    token: createToken(user)
                });
            } else {
                return res.status(400).json({ msg: 'The email and password don\'t match.' });
            }
        });
    });
};

exports.searchDest = (req, res) => {
    console.log(req.body.name);
    // console.log(req.length);
    var que=req.body.name;
    console.log(que.length);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("ClientDB");
         // var a="/^"+req.body.name+"/i";
         // console.log(req.body.name);
        // dbo.collection("stations").find({AreaName:/^req.body.name/i}).toArray(function(err, result) {
        if(que.length>1)
        {
        	dbo.collection("stations").find({AreaName: new RegExp ('^'+req.body.name,'i')}).toArray(function(err, result) {
        
          if (err) throw err;
           console.log(result.length);
           // console.log(result[0]['Name']);
          res.json(result);
          db.close();
        	});
        }
        else	
        {
        	let result=[];
        	console.log(result);
        	res.json(result);
        }
      });
};
exports.findStation = (req, res) => {
    var min=9999;
	var src;
	var lati=req.body.lat;
	var longi=req.body.longi;
	MongoClient.connect(url, function(err, db) {
        var GeoPoint = require('geopoint');
		if (err) throw err;
        var dbo = db.db("ClientDB");
		dbo.collection("stations").find().toArray(function(err, result) {
          if (err) throw err;    
		  var i;
		  
		  for(i=0 ; i < result.length ; i++)
		  {
			// console.log(result[i]["Latitude"]);
			// console.log(result[i]["Longitude"]);			
			point1 = new GeoPoint(parseFloat(lati), parseFloat(longi));
			point2 = new GeoPoint(parseFloat(result[i]["Latitude"]), parseFloat(result[i]["Longitude"]));
			var distance = point1.distanceTo(point2, true)
			// console.log(distance)      
			if( min > distance )
			{
				min=distance;
				src=result[i];
			}			
          }
          db.close();
        });
    });
		  if(min < 0.5)
		  {
            console.log("found.........................!!!!!!!!!!");
		 	console.log(min);
		  	res.json(src);	
		  }
		  else          //write new station cord
		  {
            console.log("not found.......!!!!!!!!!!!!!!!!!!!!!");
            newStation(lati,longi);
            res.send(null);
          }
		  // res.send(src);
        
      
};
var newStation = function(lati,longi){
    console.log(lati);
    console.log(longi);
    MongoClient.connect(url, function(err, db) {
        var GeoPoint = require('geopoint');
		if (err) throw err;
        var dbo = db.db("ClientDB");
        var loc={
            Latitude : lati,
            Longitude : longi
        };
        dbo.collection("newStations").insertOne(loc,function(err, result) {
            if (err) throw err;    
            console.log("inserted");
            db.close();
              });
    });
}
