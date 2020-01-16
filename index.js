//peppermint-petition.index.js
const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const csurf = require("csurf");
//const cp = require('cookie-parser');
//cookie-parser is gone! we now use use cookie-session
const cookieSession = require("cookie-session");
const bcrypt = require("./bcrypt");
//MIDDLEWARE
//this configures express to use express-handlebars
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("./public"));

//app.use(cp());
app.use(
    express.urlencoded({
        extended: false
    })
);

//secret: To encrypt the data
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

//------ROUTES---------------------------------
//////////////////////////////////////
//FUNCTION: REGISTER

//redirect from / to /register
app.get("/", (req, res) => {
    res.redirect("/register");
});

//register page shows up
app.get("/register", (req, res) => {
    console.log("GET REGISTER request to / happened!");
    console.log("req.session: ", req.session);
    res.render("register", {
        layout: "main"
    });
});

//USER PUTS IN SIGN UP DATA AND PUSHES BUTTON
app.post("/register", (req, res) => {
    console.log("PUSH_SIGN UP request to / happened!");
    //HASHING THE PASSWORD BEFORE PUTTING IT IN THE DATABASE
    bcrypt
        .hash(req.body.password)
        .then(hashedPassword => {
            //PUTTING SIGN IN-INFO IN THE DATABASE
            return db.registerUser(
                req.body.first,
                req.body.last,
                req.body.mailAddress,
                hashedPassword
            );
        })
        .then(id => {
            //SETTING THE COOKIES, LOGIN
            console.log("ID = ", id);
            req.session.userId = id.rows[0].id;
            res.redirect("/profile");
        })
        .catch(err => {
            console.log("error in registration", err);
            res.render("/register", { err });
        });
});

//PROFILE PAGE
app.get("/profile", (req, res) => {
    console.log("GET request to /profile happened!");
    res.render("profile", {
        layout: "main"
    });
});

app.post("/profile", (req, res) => {
    console.log("POST request to /profile happened");
    db.setProfile(
        req.body.age,
        req.body.city,
        req.body.url,
        req.session.userId
    ).then(result => {
        console.log("Profil result", result.rows);
        res.redirect("/petition");
    });
});

//LOGIN PAGE
app.get("/login", (req, res) => {
    console.log("GET request to /login happened!");
    res.render("login", {
        layout: "main"
    });
});

//USER LOGS IN - WE COMPARE THE HASHED PASSWORDS
//HashPass has two objects(id, password): So you need to specify (.password) to get the password
app.post("/login", (req, res) => {
    console.log("GET LOGIN request to / happened!");
    db.getInfoByEmail(req.body.mailAddress)
        .then(hashPassFromDB => {
            console.log("hashPassFromDB", hashPassFromDB);
            //compare() hashes automatically the typedin password
            if (bcrypt.compare(hashPassFromDB.password, req.body.password)) {
                console.log("password input matches");
                //setting the cookies
                //USER-ID locked here
                req.session.userId = hashPassFromDB.id;
                //NOW: Did the user already sign for the petition?
                //Check in the signature database if the user_id is there
                db.checkForSignatureId(req.session.userId).then(result => {
                    console.log("check-results", result);
                    console.log("check-results2", result[0].id);
                    //If the length is 0, the user has not "signatured" yet - let him/her sign
                    if (result.length == 0) {
                        res.redirect("/petition");
                    } else {
                        req.session.signatureId = result[0].id;
                        res.redirect("/signed");
                    }
                });
            } else {
                //if the passwords do not matches
                console.log("Password doesnt exist");
            }
        })
        .catch(err => {
            console.log("error in registration", err);
            res.render("/login", { err });
        });
});

//Launch Main Page: Petition
//USER TYPES IN DATA AND SUBMITS
app.get("/petition", (req, res) => {
    console.log("GET request to /petition happened!");
    console.log("req.session: ", req.session);
    // res.locals.csrfToken = req.csrfToken();
    res.render("home", {
        layout: "main"
    });
});
//GOES TO THANK YOU-PAGE
app.post("/petition", (req, res) => {
    //THEN (.then) STORING CURRENT ID IN THE COOKIES
    console.log("THIS LOG ", req.body.signature, req.session.userId);
    db.addSignature(req.body.signature, req.session.userId)
        .then(result => {
            let currentId = result.rows[0].id;
            console.log("Current ID is: ", currentId);
            //cookie key is: signatureId, value is currentId
            req.session.signatureId = currentId;
            console.log("POST request to /petition happened!");
            console.log(req.body);
            res.redirect("/signed");
        })
        .catch(err => console.log("error in post-petition", err));
});

//SIGNERS ROUTE
//USER SEES THANK YOU-PAGE
//THE SIGNATURE DATA IS TAKEN FROM DATABASE AND REBUILT INTO AN IMAGE
app.get("/signed", (req, res) => {
    console.log("GET request to /signed happened!");
    Promise.all([db.getSignature(req.session.signatureId), db.countRows()])
        .then(result => {
            console.log("RESULT from getSignature and countRows: ", result);
            res.render("thanks", {
                layout: "main",
                output: result[0].signature,
                amountOfSubscribers: result[1].count
            });
        })
        .catch(err => console.log("error in signed", err));
});

//LAST PAGE _ USER SEES LISTS OF SUBSCRIBERS
app.get("/signers", (req, res) => {
    console.log("GET request to /signers happened!");
    db.dataFromThreeTables()
        .then(result => {
            res.render("signers", {
                layout: "main",
                listOfSigners: result
            });
            console.log("result - for list of signers: ", result);
        })
        .catch(err => console.log("error in signers", err));
});

app.get("/signers/:city", (req, res) => {
    console.log("GET request to /signers/:city happened");
    db.getSignersByCity(req.params.city)
        .then(result => {
            console.log("result from signers/city: ", result);
            res.render("signersByCity", {
                layout: "main",
                listOfSigners: result,
                city: req.params.city
            });
        })
        .catch(err => console.log("error in signers/:city", err));
});

app.listen(process.env.PORT || 8080, () =>
    console.log("port 8080 listening ...")
);
