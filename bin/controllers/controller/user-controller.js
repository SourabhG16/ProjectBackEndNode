var User = require('../models/user');
var jwt = require('jsonwebtoken');
var config = require('../config/config');
let date = require('date-and-time');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var OWM = require("openweathermap-node");

const helper = new OWM(
    {
        APPID: config.WeatherapiKey,
        units: "imperial"
    }
);
function createToken(user) {
    return jwt.sign({ id: user.Id, Email: user.Email }, config.jwtSecret, {
        expiresIn: 2000 // 86400 expires in 24 hours
      });
}
function retName(user)
{
    return user.Name;
}
exports.registerUser = (req, res) => {
    if (!req.body.Email || !req.body.Password) {
        return res.status(400).json({ 'msg': 'You need to send email and password' });
    }

    User.findOne({ Email: req.body.Email }, (err, user) => {
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
    if (!req.body.Email || !req.body.Password) {
        return res.status(400).send({ 'msg': 'You need to send email and password' });
    }

    User.findOne({ Email: req.body.Email }, (err, user) => {
        if (err) {
            return res.status(400).send({ 'msg': err });
        }

        if (!user) {
            return res.status(400).json({ 'msg': 'The user does not exist' });
        }

        user.comparePassword(req.body.Password, (err, isMatch) => {
            if (isMatch && !err) {
                return res.status(200).json({
                    token: createToken(user),
                    Name:  retName(user)
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
    var min=9999.9999;
    var src;
    var bool=0;
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
			point1 = new GeoPoint(parseFloat(lati), parseFloat(longi));
			point2 = new GeoPoint(parseFloat(result[i]["Latitude"]), parseFloat(result[i]["Longitude"]));
			var distance = point1.distanceTo(point2, true)
			//console.log(distance);     
			if( min > distance )
			{
				min=distance;
				src=result[i];
            }			
           //console.log("min is"+min);
          }
          if(min < 10.5)
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
          db.close();
        });
    });
		  // res.send(src);
};
var newStation = function(lati,longi){
    console.log(lati);
    console.log(longi);
    MongoClient.connect(url, function(err, db) {

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
exports.tripRecord = (req, res) => {
  
    var type;
    console.log("are u there");
    console.log(req.body.data);
     MongoClient.connect(url, function(err, db) {
    
    var dbo = db.db("ClientDB");
    dbo.collection("customers").findOne({ Name: req.body.data[2]}, (err, user) => {
        if (err) throw err; 
        
        if(user){
            type=user.Type;
            console.log("in"+type); 
            insertRecord(type,req.body.data);
        }
        db.close(); 
        res.send();     
    });
});

};
 function insertRecord(type,data){
    var weather;
    helper.getCurrentWeatherByCityName("Pune", (err, currentWeather) => {
    if(err){
        console.log(err);
        return null;
    }
    else{
        //console.log(currentWeather);
        weather=JSON.stringify(currentWeather.main);
       // console.log("Wea:"+weather);
        let now = new Date();
        var record={
            sourceStation:data[0].Name,
            destStation:data[1].Name,
            userType:type,
            weatherData:weather,    
            tourDate:date.format(now,'MMM DD YYYY'),
            startTime:date.format(now,'HH:mm:ss'),
            userName:data[2],
            Duration:null,
            };
           // console.log("record: "+record); 
            MongoClient.connect(url, function(err, db) {
            var dbo = db.db("ClientDB");
            dbo.collection("tripRecords").insertOne(record,function(err, result) {
            if (err) throw err;    
            console.log("inserted trip Records");
            db.close();
        });
        });
        }
    });   
}
exports.Transaction = (req,res) =>{

    //console.log(req.body[2]);
    MongoClient.connect(url, function(err, db) {
    var dbo = db.db("ClientDB");
    var myquery = { Name: req.body[2] };
    dbo.collection("customers").updateOne(myquery,{ "$inc": {"AccountBalance": -5}},function(err, res1) {
    if (err) throw err;
    if(res1)
    {
    console.log("1 document updated");
    db.close();
    return res.status(201).json({ msg: 'Payment SuccessFul!' });
    }
     });
});  
}
exports.tripDuration = (req,res) =>{
    //var a=req.body[1];
    console.log(req.body[0]);
    console.log(req.body[1]);
    
   MongoClient.connect(url, function(err, db) {
    var dbo = db.db("ClientDB");
    var myquery = { userName: req.body[1] };
    dbo.collection("tripRecords").findOneAndUpdate(myquery,{ "$set": {"Duration": req.body[0]}},{sort: { startTime: -1 }},function(err, res1) {
    if (err) throw err;
    if(res1)
    {
    console.log("1 document updated and Duration Inserted");
    db.close();
    return res.status(201).json({ msg: 'Trip SuccessFul!' });
    }
     });
})
}
