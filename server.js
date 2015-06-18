var http = require('http');
var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var bodyParser = require("body-parser");


var router = express();
var server = http.createServer(router);


var db = new sqlite3.Database('Chinook_Sqlite.sqlite');

router.get('/', function(req, res){
  res.send("You are looking fabulous today!");
});

//builds array of customers
var customers = [];
db.each("select CustomerId, FirstName, LastName, Email from Customer", function(err, row){
    customers.push({CustomerId:row.CustomerId, FirstName:row.FirstName, LastName:row.LastName, Email:row.Email});
  });
  
//should return an array of JSON objects having CustomerId, FirstName, LastName, and Email
router.get('/customer', function(req, res){
  res.json(customers);
});

//should return a JSON object with all of the information about a customer
router.route('/customer/:CustomerId')
.get(function(req, res){
  var id = req.params.CustomerId;
  db.get("select * from Customer where CustomerId= " + id, function(err, row){
    res.json({CustomerId:row.CustomerId, FirstName:row.FirstName, LastName:row.LastName, 
              Company:row.Company, Address:row.Address, City:row.City, State:row.State, 
              Country:row.Country, PostalCode:row.PostalCode, Phone:row.Phone, Fax:row.Fax, Email:row.Email, SupportRepId:row.SupportRepId});
    });
});

//should return an array of JSON objects having InvoiceId, InvoiceDate, and Total.
router.route('/customer/:CustomerId/invoice')
.get(function(req, res){
    var invoices = [];
    var customerId = req.params.CustomerId;
    db.all("select InvoiceId, InvoiceDate, Total from Invoice where CustomerId= " + customerId, function(err, rows){
        rows.forEach(function(row){
            invoices.push({InvoiceId:row.InvoiceId, InvoiceDate:row.InvoiceDate, Total:row.Total});
        })
      res.json(invoices);
    });
});



//should return a JSON object having all information about that invoice plus the key 
//InvoiceLines with value an array of JSON objects having TrackId, (track) Name,
//(album) Title, (artist) Name, (genre) Name, UnitPrice, and Quantity

router.get('/customer/:CustomerId/invoice/:InvoiceId', function(req, res){
    var invoiceId = req.params.InvoiceId;
    var customerId = req.params.CustomerId;
    var json = {};
    var invoicelines = [];
    db.serialize(function(){
    db.get("select * from Invoice where InvoiceId= " + invoiceId + " and CustomerId= " + customerId, function(err, row){
            json = {InvoiceId:row.InvoiceId, CustomerId:row.CustomerId, InvoiceDate:row.InvoiceDate, BillingAddress:row.BillingAddress,
            BillingCity:row.BillingCity, BillingState:row.BillingState, BillingCountry:row.BillingCountry, BillingPostalCode:row.BillingPostalCode,
            Total:row.Total};
        });
    db.all("select TrackId, UnitPrice, Quantity, Title, T2.Name as TrackName, T5.Name as GenreName, T4.Name as ArtistName from Track T2 join Genre T5 on T2.GenreId=T5.GenreId natural join Album T3 join Artist T4 on T3.ArtistId=T4.ArtistId natural join InvoiceLine where InvoiceId= " + invoiceId, function(err, rows){
      rows.forEach(function(row){
        invoicelines.push(row);
      });
      json["invoiceLines"] = invoicelines;
      res.json(json);
    });
  });
});

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
router.use(bodyParser.json())

// POST /customer/ should take in data about a new Customer, create the customer, 
// and return the same as GET /customer/:CustomerId, most importantly the new CustomerId

//NOTE: aside from CustomerId and SupportRepId ALL values must go in as strings Example: for first name the key is FirstName and the value would be "Andy"
//ALSO: you must put in all parameters listed here
//ALSO ALSO: have to choose a CustomerId that is unique (anything >57 is safe)
router.post('/customer/', function(req, res){
    var customerId = req.body.CustomerId;
    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    var company = req.body.Company;
    var address = req.body.Address;
    var city = req.body.City;
    var state = req.body.State;
    var country = req.body.Country;
    var postalCode = req.body.PostalCode;
    var phone = req.body.Phone;
    var fax = req.body.Fax;
    var email = req.body.Email;
    var supportRepId = req.body.SupportRepId;
    var insertion = db.prepare("insert into Customer (CustomerId, FirstName, LastName, Company, Address, City, State, Country, PostalCode, Phone, Fax, Email, SupportRepId) values (" +customerId+", '"+firstName+"', '"+lastName+"', '"+company+"', '"+address+"', '"+city+"', '"+state+"', '"+country+"', '"+postalCode+"', '"+phone+"', '"+fax+"' ,'"+email+"' ,"+supportRepId + ")");
    insertion.run();
    db.get("select * from Customer where CustomerId= " + customerId, function(err, row){
    res.json({CustomerId:row.CustomerId, FirstName:row.FirstName, LastName:row.LastName, 
              Company:row.Company, Address:row.Address, City:row.City, State:row.State, 
              Country:row.Country, PostalCode:row.PostalCode, Phone:row.Phone, Fax:row.Fax, Email:row.Email, SupportRepId:row.SupportRepId});
    });
});


//PUT /customer/:CustomerId should update a customer using the given data
router.put('/customer/:CustomerId', function(req, res){
  if(req.body.CustomerId != undefined){
    db.run("update Customer set CustomerId =" + req.body.CustomerId + " where CustomerId = " + req.params.CustomerId);
  }
  if(req.body.FirstName != undefined){
    db.run("update Customer set FirstName =" + req.body.FirstName + " where CustomerId = " + req.params.CustomerId);
  }
  if(req.body.LastName != undefined){
    db.run("update Customer set LastName =" + req.body.LastName + " where CustomerId = " + req.params.CustomerId);
  }
  if(req.body.Company != undefined){
    db.run("update Customer set Company =" + req.body.Company + " where CustomerId = " + req.params.CustomerId);
  }
  if(req.body.Address != undefined){
    db.run("update Customer set Address =" + req.body.Address + " where CustomerId = " + req.params.CustomerId);
  }
  if(req.body.City != undefined){
    db.run("update Customer set City =" + req.body.City + " where CustomerId = " + req.params.CustomerId);
  }
  if(req.body.State != undefined){
    db.run("update Customer set State =" + req.body.State + " where CustomerId = " + req.params.CustomerId);
  }
  if(req.body.Country != undefined){
    db.run("update Customer set Country =" + req.body.Country + " where CustomerId = " + req.params.CustomerId);
  }
  if(req.body.PostalCode != undefined){
    db.run("update Customer set PostalCode =" + req.body.PostalCode+ " where CustomerId = " + req.params.CustomerId);
  }
  if(req.body.Phone != undefined){
    db.run("update Customer set Phone =" + req.body.Phone + " where CustomerId = " + req.params.CustomerId);
  }
  if(req.body.Fax != undefined){
    db.run("update Customer set Fax =" + req.body.Fax + " where CustomerId = " + req.params.CustomerId);
  }
  if(req.body.Email != undefined){
    db.run("update Customer set Email =" + req.body.Email + " where CustomerId = " + req.params.CustomerId);
  }
  if(req.body.SupportRepId != undefined){
    db.run("update Customer set SupportRepId =" + req.body.SupportRepId + " where CustomerId = " + req.params.CustomerId);
  }
  res.send("Customer Updated :)");
});

//DELETE /customer/:CustomerId should delete the customer
router.delete('/customer/:CustomerId', function(req, res){
  db.run("delete from Customer where CustomerId= " + req.params.CustomerId);
  res.send("Customer Deleted D:");
});



//GET /playlist should return an array of JSON objects with PlaylistId and (playlist)Name.
router.get('/playlist', function(req, res){
  var playlists = [];
  db.all("select * from Playlist", function(err, rows){
        rows.forEach(function(row){
            playlists.push({PlaylistId:row.PlaylistId, Name:row.Name});
        });
  res.json(playlists);
  });
});

//GET /playlist/:PlaylistId should return an array of JSON objects, each with 
//information about the appropriate tracks from that playlist (you can pick,
//but enough for a web-app running from this data to show interesting things about each track).
router.get('/playlist/:PlaylistId', function(req, res){
  var playlistInfo = [];
  var index = 0;
  db.all("select T1.Name as PlaylistName, T3.Name as TrackName, T3.UnitPrice as Price, T4.Name as ArtistName, T6.Title as AlbumName from  Playlist T1 natural join PlaylistTrack T2 join Track T3 on T3.TrackId=T2.TrackId join Album T6 on T3.AlbumId=T6.AlbumId join Artist T4 on T6.ArtistId=T4.ArtistId  where T1.PlaylistId= " + req.params.PlaylistId + " and T2.PlaylistId= " + req.params.PlaylistId, function(err, rows){
    rows.forEach(function(row){
      if(index < 5){
      index++
      playlistInfo.push({PlaylistName:row.PlaylistName, TrackName:row.TrackName, Price:row.Price, ArtistName:row.ArtistName, AlbumName:row.AlbumName});
      }
    });
    res.json(playlistInfo);
  });
});

//GET /revenue should return an array of JSON objects each providing the revenue of the store in a given month
router.get('/revenue', function(req, res){
  var revenues = [];
  db.all("select distinct(strftime('%Y-%m',  InvoiceDate)) as Month, round(sum(Total), 2) as Sum from Invoice group by strftime('%Y-%m', InvoiceDate)", function (err, rows){
    rows.forEach(function(row){
      revenues.push({Month:row.Month, Total:row.Sum});
    });
    res.json(revenues);
  });
});

//GET /revenue[/:year[/:month[/:day]]] should return a single JSON object giving the revenue for the requested period
router.get('/revenue/:year/:month?/:day?', function(req, res){
  if(req.params.month == undefined && req.params.day == undefined){
    db.get("select distinct(strftime('%Y', InvoiceDate)) as Year, round(sum(Total), 2) as Revenue from Invoice where strftime('%Y', InvoiceDate) = '" + req.params.year + "'", function(err, row){
      res.json(row);
    });
  }
  else if(req.params.day == undefined){
    db.get("select distinct(strftime('%Y-%m',  InvoiceDate)) as Month, round(sum(Total), 2) as Revenue from Invoice where strftime('%Y-%m', InvoiceDate) = '" + req.params.year + "-" + req.params.month + "'", function(err, row){
      res.json(row);
    });
  }
  else{
    db.get("select Total as Revenue, strftime('%Y-%m-%d', InvoiceDate) as Date from Invoice where strftime('%Y-%m-%d', InvoiceDate) = '" + req.params.year + "-" + req.params.month + '-' + req.params.day +"'", function(err, row){
      res.json(row);
    });
  }
});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});

