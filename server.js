// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var superagent = require("superagent");
var stores = require('./stores.js');
var pug = require('pug');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  var longitude = parseFloat(request.query.longitude);
  var latitude = parseFloat(request.query.latitude);
  console.log(request.query)
  var locals = {longitude: longitude, latitude: latitude};
  response.render(__dirname + '/views/index.pug', locals)
  //response.sendFile(ejs.render(__dirname + "/views/index.html", {longitude:longitude, latitude:latitude}));
  //response.sendFile(__dirname + '/views/index.html');
  console.log("hello")
});

var make_store_element = (title, description, image_url) => {
  
  var elem = {
    "title": title,
    "image_url": image_url,
    "subtitle": description,
    "default_action": {
        "type": "show_block",
        "block_name": "Coffee",
        "title": "Order Coffee"
    },
    "buttons":[
      {
        "type": "show_block",
        "block_name": "Coffee",
        "title": "Order Coffee"
      }
    ]
  };
  
  return elem

}

var make_text_message = (texts) => {
  var txt = texts.map((text) => {return {text: text}})
  return {
    messages: txt
  }
};


var make_coffee_message = (longitude, latitude) => {
  var msg = {
    "messages": [
      {"text": "رائع :) أحسنت صنعا !"},
      {
        "attachment": {
          "type": "template",
          "payload":{
        "template_type":"button",
        "text":"يمكنك تفحّص الخريطة المصاحبة لإيجاد أقرب مكتب تسجيل.",
        "buttons":[
          {
             "type":"web_url",
          "url":"https://inscriptionmap.glitch.me/?longitude={{longitude}}&latitude={{latitude}}",
          "title":"أنظر الخريطة",
        "webview_height_ratio": "compact"
          }]}
        }
      },
      {
        "text":  "سارع بالتّسجيل فجهتك بحاجة إلى صوتك! بإمكانك التّعرّف على مكاتب الاقتراع أين سيتمّ الانتخاب يوم 17 ديسمبر المقبل.",
        "quick_replies": [
          {
            "title":"مكاتب الاقتراع",
            "block_names":["BureauxVote"]
          },
          {
            "title":"الوثائق المطلوبة",
            "block_names":["how"]
          }
        ]
      }
    ]
  }
  return msg
}

var video = () => {
  var msg = {
       "messages":[
         {
            "attachment":{
      "type":"video",
      "payload":{
        "url":"https://www.youtube.com/watch?v=OVomIPUG9UE",
        type : "video/mp4"
      }
            }
    } 
          
       ]
  
  }
   return msg
}

var make_generic_message = (elems) => {
  var msg = {
      "messages": [
        {
          "attachment":{
            "type":"template",
            "payload":{
              "template_type":"generic",
              "elements": elems
            }
          }
        }
      ]
    }
  return msg
}

app.get("/order_coffee", function (request, response) {
  console.log('>>> My Coffee endpoint.')
 
  console.log("coffee_type = ", request.query)
  var message = make_coffee_message()
  response.send(message)
  

});

app.get("/coffee_nearby", function (request, response) {
    console.log('>>> Stores endpoint.')
  
    var zip = request.query.zip
    console.log('zip =', zip)
    
    // Prepare output
    var storesElements = stores.map((elem) => {
      return make_store_element(
        elem.name,
        elem.description,
        elem.image_url
      )
    })
    
    // Wrap it into the final message
    var storesMessage = make_generic_message(storesElements)
    
    console.log(storesMessage)
    
    response.send(storesMessage);
});

app.get("/tunisiensetranger", function (request, response) {
       
    // Wrap it into the final message
    var videoMessage = video()
    
    response.send(videoMessage);
});

app.get("/search_faq", function (request, response) {
    console.log('>>> Faq Search endpoint.')
    
    var query = request.query.search_query
    console.log("search_query = ", query)
    
    superagent
       .post('https://westus.api.cognitive.microsoft.com/qnamaker/v1.0/knowledgebases/331317f3-3a40-42c3-967d-3a4b404a238d/generateAnswer')
       .send({ question: query })
       .set('Ocp-Apim-Subscription-Key', process.env.QA_SECRET)
       .set('Content-Type', 'application/json')
       .end(function(err, res) {
         if (err || !res.ok) {
           response.send({answer: "Oh no! error = " + err + ", " + JSON.stringify(res)});
         } else {
           console.log("res.body =", res.body)
           var texts = [res.body.answer, "Score: " + res.body.score]
           console.log("texts =", texts)
           var textMessage = make_text_message(texts)
           console.log('textMessage =', textMessage)
           response.send(textMessage);
         }
       });
    
  });

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

