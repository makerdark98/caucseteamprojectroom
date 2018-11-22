const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

mongoose.Promise = global.Promise;
const mongourl = process.env.MONGOLAB_URI;
mongoose.connect(mongourl, { useNewUrlParser: true });
const db = mongoose.connection;
db.once("open", function(){
  console.log("DB connected");
});
db.on("error", function(err){
    console.log("DB ERROR : ", err);
  });
  
const eventSchema = mongoose.Schema({
    title:String,
    start: Date,
    end:Date,
    owner:String,
    password:String,
    phone:String,
});
const logSchema = mongoose.Schema({
    date: {type:Date, default:Date.now},
    body: String
});
function getEventsBySameTime(start, end) {
    return new Promise((resolve, reject) =>{
        let count = 0;
        Events.find({start: {$lte: start}, end: {$gt : start}}, (err, docs) =>{
            if(err) reject(err);
            count = count > docs.length ? count : docs.length;
            Events.find({start: {$lt: end}, end: {$gte : end}}, (err, docs) =>{
                if(err) reject(err);
                count = count > docs.length ? count : docs.length;
                Events.find({start: {$lt: end}, end: {$gt : start}}, (err, docs) =>{
                    if(err) reject(err);
                    count = count > docs.length ? count : docs.length;
                    resolve(count);
                });
            });
        });
    });
}
function getEventsBySameTimeInit(start, end) {
    let count = 0;
    return new Promise((resolve, reject) =>{
        Events.find({start: {$lte: start}, end: {$gt : start}}, (err, docs) =>{
            if(err) reject(err);
            count = count > docs.length ? count : docs.length;
            Events.find({start: {$lt: end}, end: {$gte : end}}, (err, docs) =>{
                if(err) reject(err);
                count = count > docs.length ? count : docs.length;
                Events.find({start: {$lt: end}, end: {$gt : start}}, (err, docs) =>{
                    if(err) reject(err);
                    count = count > docs.length ? count : docs.length;
                    Events.find({start: {$lte: start}, end: {$gte : end}}, (err, docs) =>{
                        if(err) reject(err);
                        if(docs.length>1){
                            let cntarray = [];
                            docs.forEach(doc => {
                                let tmp = getEventsBySameTime(doc.start, doc.end);
                                tmp.then(cnt => {
                                    count = count > docs.length ? count : docs.length;
                                });
                                cntarray.push(tmp);
                            });
                            Promise.all(cntarray).then(()=>{resolve(count);});
                        }
                        else resolve(count);
                    });
                });
            });
        });
    });
}

let Events = mongoose.model("event", eventSchema);
let Logs = mongoose.model("log", logSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/events", (req, res, next) => {
    Events.find({}, (err, collection) => {
        let pw = "password";
        let phone = "phone";
        let new_data = [];
        collection.forEach(element => {
            new_element = {
                title: element.title,
                start: element.start,
                end: element.end,
            };
            new_data.push(new_element);
        });
        res.send(new_data);
    });
});

app.post("/events", (req, res, next) => {
    new Logs({body:JSON.stringify(req.body)}).save();
    let start = new Date(req.body.start);
    let end = new Date(req.body.end);
    let diff = (end.getTime() - start.getTime()) / (1000*60*60);
    if(diff>3) {
        res.send("<h1>룰을 확인하시고 다시 시도해주세요</h1><h2>시간규칙 위반</h2><a href='/'>뒤로가기</a>");
        return;
    }
    let daydiff = (start.getTime() - Date.now()) / (1000*60*60*24);
    if(daydiff>10){
        res.send("<h1>룰을 확인하시고 다시 시도해주세요</h1><h2>날짜규칙 위반</h2><a href='/'>뒤로가기</a>");
        return;
    }
    getEventsBySameTimeInit(start, end).then( cnt => {
        //console.log(cnt);
        if(cnt>=2) res.send("<h1>룰을 확인하시고 다시 시도해주세요</h1><h2>최대 동시 2팀</h2><a href='/'>뒤로가기</a>");
        else (new Events(req.body)).save((err,event) => res.redirect("/index.html"));
    }).catch( err => {
      console.log(err);
      res.send("내부에러 어떻게 에러가 났는지 개발자에게 꼭 재보해주세요");
    });
});
app.post("/delete", (req, res) => {
    new Logs({body:JSON.stringify(req.body)}).save();
    Events.deleteOne({"start":req.body.start,"end":req.body.end,"password":req.body.password}, () => {
        res.redirect("/index.html");
    });
});

app.listen(process.env.PORT || 3000);

