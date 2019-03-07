var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");

var app = express();

var databaseUrl = process.env.MONGODB_URI || "scraper";
var collections = ["scrapedData"];

var PORT = process.env.PORT || 3000

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

app.get("/", function(req, res) {
  res.send("Hello world");
});

app.get("/all", function(req, res) {

  db.scrapedData.find({}, function(error, found) {

    if (error) {
      console.log(error);
    }
   
    else {
      res.json(found);
    }
  });
});

app.get("/scrape", function(req, res) {
  
  axios.get("https://www.gamespot.com/news/").then(function(response) {
    
    var $ = cheerio.load(response.data);
    
    $("article").each(function(i, element) {
     
      var title = $(element).find("h3").text();
      var link = $(element).find("a").attr("href");
      var img = $(element).find("img").attr("src");

      if (title && link && img) {
        
        db.scrapedData.insert({
          title: title,
          link: link,
          img: img
        },
        function(err, inserted) {
          if (err) {
          
            console.log(err);
          }
          else {
           
            console.log(inserted);
          }
        });
      }
    });
  });

  res.send("Scrape Complete");
});

app.listen(PORT, function() {
  console.log("App running on port 3000!");
});
