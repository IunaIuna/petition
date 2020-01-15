//peppermint-petition.index.js
const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
// const csurf = require("csurf");
//const cp = require('cookie-parser');
//cookie-parser is gone! we now use use cookie-session
const cookieSession = require("cookie-session");
const bcrypt = require("./bcrypt");
//MIDDLEWARE
//this configures express to use express-handlebars
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("./public"));

//secret: To encrypt the data
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
//app.use(cp());
app.use(
    express.urlencoded({
        extended: false
    })
);

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
            req.session.userId = id;
            res.redirect("/petition");
        })
        .catch(err => console.log("error in registration", err));
});

//LOGIN PAGE
app.get("/login", (req, res) => {
    console.log("GET LOGIN request to / happened!");
    res.render("login", {
        layout: "main"
    });
});

//USER LOGS IN - WE COMPARE THE HASHED PASSWORDS
//HashPass has two objects(id, password): So you need to specify (.password) to get the password
// app.post("/login", (req, res) => {
//     console.log("GET LOGIN request to / happened!");
//     db.getInfoByEmail(req.body.mailAddress)
//         .then(hashPassFromDB => {
//             console.log("hashPassFromDB", hashPassFromDB);
//             //compare() hashes automatically the typedin password
//             if (bcrypt.compare(hashPassFromDB.password, req.body.password)) {
//                 console.log("password input matches");
//                 //setting the cookies
//                 req.session.userId = hashPassFromDB.id;
//                 //NOW: Did the user already sign for the petition?
//                 //Check in the signature database if the user_id is there
//                 db.checkForSignatureId(req.session.userId).then(result => {
//                     console.log("check-results", result);
//                     //If the length is 0, the user has not "signatured" yet
//                     if (result.length == 0) {
//                         res.redirect("/petition");
//                     }
//                 });
//             }
//         })
//         .then(val => console.log("value: ", val))
//         .catch(err => console.log("Error in login: ", err));
//     res.redirect("/petition");
// });

//Launch Main Page: Petition
//USER TYPES IN DATA AND SUBMITS
app.get("/petition", (req, res) => {
    console.log("GET PETITION request to / happened!");
    console.log("req.session: ", req.session);
    // res.locals.csrfToken = req.csrfToken();
    res.render("home", {
        layout: "main"
    });
});

//GOES TO THANK YOU-PAGE

app.post("/petition", (req, res) => {
    //SENDING INPUT INFO TO DATABASE
    //THEN (.then) STORING CURRENT ID IN THE COOKIES
    db.addUser(req.body.first, req.body.last, req.body.signature).then(
        result => {
            let currentId = result.rows[0].id;
            console.log("Current ID is: ", currentId);
            //cookie key is: signatureId, value is currentId
            req.session.signatureId = currentId;
            res.redirect("/signed");
        }
    );
    console.log("POST PETITION request to / happened!");
    console.log(req.body);
});
// app.use(csurf());

//SIGNERS ROUTE
//USER SEES THANK YOU-PAGE
//THE SIGNATURE DATA IS TAKEN FROM DATABASE AND REBUILT INTO AN IMAGE
app.get("/signed", (req, res) => {
    console.log("GET THANKS request to / happened!");
    Promise.all([
        db.getSignature(req.session.signatureId),
        db.countRows()
    ]).then(result => {
        // console.log("SIGNATURE IS: ", result[0].rows[0].signature);
        res.render("thanks", {
            layout: "main",
            output: result[0].rows[0].signature,
            amountOfSubscribers: result[1].rows[0].count
        });
        // console.log("RESULTS: ", result);
        // console.log("result1: ", result[0].rows);
        // console.log("results2: ", result[1].rows[0].count);
    });
});

//LAST PAGE _ USER SEES LISTS OF SUBSCRIBERS
app.get("/signers", (req, res) => {
    console.log("GET SIGNERS request to / happened!");
    db.showMeAllSigners().then(result => {
        res.render("finalPage", {
            layout: "main",
            listOfSigners: result.rows
        });
        console.log("result - for list of signers: ", result.rows);
    });
});

app.listen(process.env.PORT || 8080, () =>
    console.log("port 8080 listening ...")
);
