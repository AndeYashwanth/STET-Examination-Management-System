const express = require('express');
const app = express();
const PORT = 8081;//process.env.PORT||
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fs = require('fs-extra')
var path = require("path");
const mongoClient = require('mongodb').MongoClient
ObjectId = require('mongodb').ObjectId
const DB = require('./db.js');
const User = DB.admit_card;
const puppeteer = require('puppeteer'); 
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
var cors = require('cors');

app.use(express.static(__dirname + '/public')); // change to whichever directory has images, should contain card.css
app.use(cors());
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const url = "mongodb+srv://dbuser:Kmit123@cluster0.wmp3k.mongodb.net/project-stet?retryWrites=true&w=majority"

const back_url = "http://localhost:" + PORT;
console.log(back_url);

const conn = mongoose.createConnection(url);

// Init gfs
let gfs;
let buffer;


conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('Photo_Documents');
});

if(process.env.NODE_ENV === 'production')
{
	app.use(express.static('client/build/'));
	app.get('*',(req,res) => {
		res.sendFile(path.resolve(__dirname,'client','build','index.html'));
	});
}

mongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    if (err) {
        console.log("error in connecting to mongodb")
    }
    else {
        console.log("Connected")
        const myDb = db.db('project-stet')
        
        app.get('/total', (req, res) => {
            const collection = myDb.collection('signups')
            collection.count({}, function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    res.json({
                        "total": result
                    });
                }
            })
        })

        app.get('/stats', (req, res) => {
            Details = {
                Gender:{},
                Exam:{},
                Category:{},
            }
            const collection = myDb.collection('registration')
            
            var options = {
                projection: {
                  Gender: 1,
                  Category: 1,
                  Exam: 1,
                },
              };
            
            collection.find({},options).toArray(function(err,result){
                if (err) {
                    console.log(err);
                    res.status(400).json("Error: " + err);
                  } else {
                    Details.Gender.Male = result.filter((obj) => obj.Gender === "Male").length;
                    Details.Gender.Female = result.filter((obj) => obj.Gender === "Female").length;
                    Details.Gender.Others = result.filter((obj) => obj.Gender === "Others").length;
                    Details.Exam.primary = result.filter((obj) => obj.Exam === "Primary Teacher").length;
                    Details.Exam.gtart = result.filter((obj) => obj.Exam === "GT Art").length;
                    Details.Exam.gtscience = result.filter((obj) => obj.Exam === "GT Science").length;
                    Details.Category.general = result.filter((obj) => obj.Category === "General").length;
                    Details.Category.obc = result.filter((obj) => obj.Category === "OBC").length;
                    Details.Category.sc = result.filter((obj) => obj.Category === "SC").length;
                    Details.Category.st = result.filter((obj) => obj.Category === "ST").length;
                    Details.Amount = (result.length)*400;
                    Details.Registerd = result.length;   
                }

                res.send(Details);
            })
        })

        
        app.get('/alldetails/:user', (req, res) => {
            var User = {}
            myDb.collection('personals').findOne({ "Phone": req.params.user }, function (err, result) {
                if (err)
                    throw err
                else if (result != null) {
                    User.Fname = result.Fname
                    User.Mname = result.Mname
                    User.Lname = result.Lname
                    User.Gender = result.Gender
                    User.FHFname = result.FHFname
                    User.FHMname = result.FHMname
                    User.FHLname = result.FHLname
                    User.DOB = result.DOB
                    User.Community = result.Community
                    User.Aadhar = result.Aadhar
                    User.Hno = result.Hno
                    User.Area = result.Area
                    User.District = result.District
                    User.State = result.State
                    User.Pincode = result.Pincode
                    User.Phone = result.Phone
                    User.Email = result.Email
                }
            })

            myDb.collection('academics').findOne({ "Phone": req.params.user }, function (err, result) {
                if (err)
                    throw err
                else if (result != null) {
                    User.MinQualification = result.Min_Qual;
                    User.ProfessionalQualification = result.Pro_Qual;
                    User.Percentage = result.Percentage;
                    User.University = result.University;
                    User.PaperLanguage = result.Language;
                    User.ApplicationCategory = result.ApplicationCategory;
                }

            })

            myDb.collection('Payment_Details').findOne({ "Phone": req.params.user }, function (err, result) {
                if (err)
                    throw err
                else if (result != null) {
                    User.UserContact = result.UserContact
                    User.PaymentEmail = result.UserEmail
                    User.PaymentId = result.PaymentId
                    User.Payment_date = result.Sate
                    User.Payment_signature = result.Signature
                    User.Amount = result.amount
                }

            })
            myDb.collection('registration').findOne({ "Phone": req.params.user }, function (err, result) {
                if (err)
                    throw err
                else if (result != null) {
                    User.FinalSubmissionDate = result.Date
                }
                res.send(JSON.stringify(User));
            })

        })
        
        app.get('/allusers', (req, res) => {
            var array=[];
            myDb.collection("signups").find({}).toArray(function (err, result) {
                if (err) {
                    return;
                }
                else {
                    var count = result.length
                    result.forEach((item) => {
                            var newUser = {
                                 "id":item.Phone,
                                "Name": item.Name,
                                "Email":item.Email,
                                "Phone": item.Phone
                            }
                            array.push(newUser)
                    });
                    res.send(JSON.stringify(array))
                }
            })
        });

        app.get('/submittedusers', (req, res) => {
            var array=[];
            myDb.collection("registration").find({}).toArray(function (err, result) {
                if (err) {
                    return;
                }
                else {
                    var i = 0
                    var count = result.length
                    result.forEach(item => {
                        let newUser = {
                            "id":item.Phone,
                            "Name":item.Fname+" "+item.Lname,
                            "Email":item.Email,
                            "Aadhar": item.Aadhar,
                            "Phone": item.Phone,
                            "Role": item.Exam,
                        }
                        array.push(newUser)
                    });
                    res.send(JSON.stringify(array))  
                }
            })
        });

        //=============== PDF ROUTES BEGIN =========================================

    app.get('/pdf/:Fname/:Fname/:FHFname/:FHLname/:DOB/:Exam/:Eno/:Address/:Venue/:Exam_date/:Gender/:img',function(req,res){
        const data = {
            Fname: req.params.Fname,
            Lname: req.params.Lname,
            FHFname: req.params.FHFname,
            Flname: req.params.FHLname,
            DOB: req.params.DOB,
            img: req.params.img,
            simg: '/sikkim.png',
            Exam: req.params.Exam,
            Eno: req.params.Eno,
            Address: req.params.Address,
            Venue: req.params.Venue,
            Exam_date: req.params.Exam_date,
            Gender: req.params.Gender
        };
        res.render('ejs_admit.html', {data: data});
    });

    async function findData({Phone}){
        return new Promise(async function(resolve, reject){
        const user = await User.findOne({ 'Phone': Phone });
        if(user==null)
            resolve(null);
        else
        {
            const data = {
                Fname: user.Fname,
                Lname: user.Lname,
                FHFname: user.FHFname,
                FHLname: user.FHLname,
                DOB: user.DOB,
                img: `${user.Phone}_photo.png`,
                Exam: user.Exam,
                Eno: user.Eno,
                Address: user.Hno + user.Area  + user.District + user.State + user.Pincode,
                Venue: user.Venue,
                Exam_date: user.Exam_date,
                Gender: user.Gender,
                Phone: user.Phone
            };
            resolve(data);
        }
    });
    }
    app.post('/pdf/generate', function(req, res){
        console.log(req.body);  
        var Phone = req.body.Phone;
        (async () => {
            const data = await findData({Phone});               // declare function
            if(data == null){
                console.log("Phone number not found");
                res.sendStatus(404);
            }
            else
            {
                const browser = await puppeteer.launch();     // run browser
                const page = await browser.newPage();         // create new tab
                //await page.addStyleTag({path : "../public/card.css"});
                await page.goto(back_url + `/pdf/${data.Fname}/${data.Lname}/${data.FHFname}/${data.FHLname}/${data.DOB}/${data.Exam}/${data.Eno}/${data.Address}/${data.Venue}/${data.Exam_date}/${data.Gender}/${data.img}`, {waitUntil: 'load', timeout: 0 });  // go to page
                await page.emulateMedia('screen');            // use screen media
                buffer = await page.pdf({path: data.Phone + '_admit.pdf', displayHeaderFooter: true, printBackground: true});  // generate pdf
                //upload.single(buffer);
                await browser.close();                       // close browser
                
                var bucket = new mongodb.GridFSBucket(myDb);
                /**
                 * @todo revert unlink and upload file in db.
                 */
                fs.createReadStream('./'+ data.Phone + '_admit.pdf').
                    pipe(bucket.openUploadStream(data.Phone + '_admit.pdf', { contentType: 'application/pdf' })).
                    on('finish', function() {
                        console.log('done!');
                    });
                    fs.unlink('./'+ data.Phone + '_admit.pdf', (err) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                    });
                res.sendStatus(200);
            }
            })();
    });
    app.post('/pdf/regenerate', async function(req, res){
        console.log(req.body);
        var phone = req.body.phone;
        const data = await findData({phone});
        if(data == null){
            console.log("Phone number not found");
            res.sendStatus(404);
        }
        else
        {
            console.log(data);  
            await deletePDF(data.phone); 
            (async () => {
            const browser = await puppeteer.launch();     // run browser
            const page = await browser.newPage();         // create new tab
            await page.goto(back_url + `/pdf/${data.fname}/${data.lname}/${data.ffname}/${data.flname}/${data.dob}/${data.exam}/${data.eno}/${data.address}/${data.venue}/${data.exam_date}/${data.sex}/${data.img}`, {waitUntil: 'load', timeout: 0 });  // go to page
            await page.emulateMedia('screen');            // use screen media
            buffer = await page.pdf({path: data.phone + '_admit.pdf', displayHeaderFooter: true, printBackground: true});  // generate pdf
            await browser.close();                       // close browser
            var bucket = new mongodb.GridFSBucket(myDb);
        
            fs.createReadStream('./'+ data.phone + '_admit.pdf').
            pipe(bucket.openUploadStream(data.phone + '_admit.pdf')).
            on('finish', function() {
                console.log('done!');
            });
            fs.unlink('./'+ data.phone + '_admit.pdf', (err) => {
                if (err) {
                console.error(err)
                return
                }
            });
            res.sendStatus(200);
            })();
        }
    })
    app.post('/generate_all', function(req, res){
        User.find({}, (err, users)=>{
        console.log("I am Alive");
        if(err)
            console.log(err);
        
        users.map(async function(user){
            console.log("I can feel it");
            const data = {
                fname: user.fname,
                lname: user.lname,
                ffname: user.ffname,
                flname: user.flname,
                dob: user.dob,
                img: `${user.phone}_photo.png`,
                exam: user.exam,
                eno: user.eno,
                address: user.address,
                venue: user.venue,
                exam_date: user.exam_date,
                sex: user.sex
            };
            const browser = await puppeteer.launch();     // run browser
            const page = await browser.newPage();         // create new tab
            //await page.addStyleTag({path : "../public/card.css"});
            await page.goto(back_url + `/pdf/${data.fname}/${data.lname}/${data.ffname}/${data.flname}/${data.dob}/${data.exam}/${data.eno}/${data.address}/${data.venue}/${data.exam_date}/${data.sex}/${data.img}`, {waitUntil: 'load', timeout: 0 });  // go to page
            await page.emulateMedia('screen');            // use screen media
            buffer = await page.pdf({path: user.phone + '_admit.pdf', displayHeaderFooter: true, printBackground: true});  // generate pdf
            //upload.single(buffer);
            await browser.close();                       // close browser    
            var bucket = new mongodb.GridFSBucket(myDb);
            
            fs.createReadStream('./'+ user.phone + '_admit.pdf').
                pipe(bucket.openUploadStream(user.phone + '_admit.pdf')).
                on('finish', function() {
                console.log('done!');
                });
                fs.unlink('./'+ user.phone + '_admit.pdf', (err) => {
                if (err) {
                    console.error(err)
                    return
                }
                });
            });
        }).then(function(){res.send(200);});
    });

    app.post('/regenerate_all', function(req, res){
        var myquery = { };
        myDb.collection("fs.files").deleteMany(myquery, function(err, obj) {
        if (err) throw err;
        console.log(obj.result.n + " document(s) deleted");
        });
        myDb.collection("fs.chunks").deleteMany(myquery, function(err, obj) {
        if (err) throw err;
        console.log(obj.result.n + " document(s) deleted");
        });

        User.find({}, (err, users)=>{
            console.log("I am Alive");
            if(err)
            console.log(err);
            
            users.map(async function(user){
            console.log("I can feel it");
            const data = {
                fname: user.fname,
                lname: user.lname,
                ffname: user.ffname,
                flname: user.flname,
                dob: user.dob,
                img: `${user.phone}_photo.png`,
                exam: user.exam,
                eno: user.eno,
                address: user.address,
                venue: user.venue,
                exam_date: user.exam_date,
                sex: user.sex
            };
            const browser = await puppeteer.launch();     // run browser
            const page = await browser.newPage();         // create new tab
            //await page.addStyleTag({path : "../public/card.css"});
            await page.goto(back_url + `/pdf/${data.fname}/${data.lname}/${data.ffname}/${data.flname}/${data.dob}/${data.exam}/${data.eno}/${data.address}/${data.venue}/${data.exam_date}/${data.sex}/${data.img}`, {waitUntil: 'load', timeout: 0 });  // go to page
            await page.emulateMedia('screen');            // use screen media
            buffer = await page.pdf({path: user.phone + '_admit.pdf', displayHeaderFooter: true, printBackground: true});  // generate pdf
            //upload.single(buffer);
            await browser.close();                       // close browser
            var bucket = new mongodb.GridFSBucket(myDb);
        
            fs.createReadStream('./'+ user.phone + '_admit.pdf').
            pipe(bucket.openUploadStream(user.phone + '_admit.pdf')).
            on('finish', function() {
                console.log('done!');
            });
            fs.unlink('./'+ user.phone + '_admit.pdf', (err) => {
                if (err) {
                console.error(err)
                return
                }
            });
        });  
    }).then(function(){res.send(200);});
    });

    app.get('/pdf/admit_card.pdf', function(req, res){
    res.send(buffer);
    })

    app.post('/register', async function(req, res){
        // if (await User.findOne({ username: req.body.eno })) {
        //     throw 'Username "' + req.body.eno + '" is already taken';
        // }
        const user = new User(req.body);
        await user.save()
        .then(()=>res.json({}))
        .catch(err=>next(err));
    })

    app.get('/image/:filename', function(req, res){
        gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
            // Check if file
            if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
            }
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
        });
    });

    async function deletePDF(phone){
    return new Promise(async function(resolve, reject){
        var fileid;
        var myquery = { filename: phone + "_admit.pdf"};
        var foundfile = await myDb.collection("fs.files").findOne(myquery);
        console.log(foundfile);
        fileid = foundfile._id;
        myDb.collection("fs.files").deleteOne(myquery, function(err, obj) {
        if (err) throw err;
        console.log(obj.result.n + " document(s) deleted");
        });
        myquery = {files_id: fileid};
        myDb.collection("fs.chunks").deleteMany(myquery, function(err, obj) {
        if (err) throw err;
        console.log(obj.result.n + " document(s) deleted");
        });
        resolve(1);
    });
    }

//=================== PDF ROUTES END ==================================
    }
})


app.listen(PORT, function () {
    console.log("Server is running on Port: " + PORT);
});
