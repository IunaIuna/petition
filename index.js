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
                req.body.email,
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
            res.render("register", { err });
        });
});

//PROFILE PAGE
app.get("/profile", (req, res) => {
    console.log("GET request to /profile happened!");
    if (!("userId" in req.session)) {
        res.redirect("/login");
        return;
    }
    res.render("profile", {
        layout: "main"
    });
});

//PROFILE
app.post("/profile", (req, res) => {
    console.log("POST request to /profile happened");
    if (!("userId" in req.session)) {
        res.redirect("/login");
        return;
    }
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

//PROFILE EDIT

//First: the site with all the currently existing info shows up
app.get("/profile/edit", (req, res) => {
    console.log("GET request to /profile/edit happened");
    if (!("userId" in req.session)) {
        res.redirect("/login");
        return;
    }
    db.getCurrentProfileInfo(req.session.userId)
        .then(result => {
            console.log("result from profile/edit ", result);
            res.render("profileEdit", {
                layout: "main",
                rows: result[0]
            });
        })
        .catch(err => console.log("error in profile/edit", err));
});

//Second: THE ACTUAL EDITITNG
app.post("/profile/edit", (req, res) => {
    console.log("POST request to /profile/edit happened");
    //editing the "USERS" table:
    //UPDATING THREE COLUMNS (first, last, email)
    //OR UPDATING FOUR COLUMNS (first, last, email, hashed password)
    if (!("userId" in req.session)) {
        res.redirect("/login");
        return;
    }
    if (req.body.password.length == 0) {
        db.updateThreeColumns(
            req.body.first,
            req.body.last,
            req.body.email,
            req.session.userId
        )
            .then(result => {
                console.log("result of updateThreeColumns", result);
                editUserProfiles(
                    req.body.age,
                    req.body.city,
                    req.body.url,
                    req.session.userId,
                    res
                );
            })
            .catch(err => {
                console.log("error in profile/edit/threeColumns", err);
                res.redirect("/profile/edit", { err });
            });
    } else {
        //EDIT: new password typed in
        console.log("PASSWORD SET");
        bcrypt
            .hash(req.body.password)
            .then(hashedPassword => {
                console.log("hashedPassword", hashedPassword);
                //PUTTING SIGN IN-INFO IN THE DATABASE
                db.updateFourColumns(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hashedPassword,
                    req.session.userId
                ).then(result => {
                    console.log("result of updateFourColumns", result);
                    editUserProfiles(
                        req.body.age,
                        req.body.city,
                        req.body.url,
                        req.session.userId,
                        res
                    );
                });
            })
            .catch(err => {
                console.log("error in profile/edit/FourColumns", err);
                res.redirect("/profile/edit", { err });
            });
    }
});
//EDIT: user_profiles table

function editUserProfiles(age, city, url, user_id, res) {
    db.editUserProfilesInfo(age, city, url, user_id)
        .then(result => {
            console.log("RESULT - editUserProfilesInfo", result);
            res.redirect("/profile/edit");
        })
        .catch(err => {
            console.log("error in editUserProfilesInfo", err);
            res.redirect("/profile/edit", { err });
        });
}
// /////////////------------------------------------/////////////////
//LOGIN PAGE
app.get("/login", (req, res) => {
    //SECURITY THINGY
    if ("userId" in req.session) {
        res.redirect("/profile/edit");
        return;
    }
    console.log("GET request to /login happened!");
    console.log("COOKIES? ", req.session);
    res.render("login", {
        layout: "main"
    });
});

//USER LOGS IN - WE COMPARE THE HASHED PASSWORDS
//HashPass has two objects(id, password): So you need to specify (.password) to get the password
app.post("/login", (req, res) => {
    console.log("POST request to /login happened!");
    console.log("Mail: ", req.body.mailAddress);
    db.getInfoByEmail(req.body.mailAddress)
        .then(hashedPasswordAndIdFromDB => {
            console.log("hashedPasswordFromDB", hashedPasswordAndIdFromDB);

            if (typeof hashedPasswordAndIdFromDB === "undefined") {
                console.log("mail address does not exist");
                res.render("login", { err });
            } else {
                let hashedPassword = hashedPasswordAndIdFromDB.password;
                // console.log("password: ", password);
                //compare() hashes automatically the typedin password
                bcrypt
                    .compare(req.body.password, hashedPassword)
                    .then(isPasswordMatching => {
                        console.log(isPasswordMatching);
                        if (isPasswordMatching) {
                            req.session.userId = hashedPasswordAndIdFromDB.id;
                            checkForSignatureId(req.session.userId, req, res);
                        } else {
                            console.log("Password does not match");
                        }
                    });
            }
        })
        .catch(err => {
            console.log("error in Password Retrieval", err);
            res.render("login", { err });
        });
});

function checkForSignatureId(user_id, req, res) {
    db.checkForSignatureId(user_id)
        .then(result => {
            console.log("check-results", result[0]);
            //     //If the length is 0, the user has not "signatured" yet - let him/her sign
            if (typeof result[0] === "undefined") {
                res.redirect("/petition");
            } else {
                req.session.signatureId = result[0].id;
                res.redirect("/signed");
            }
        })
        .catch(err => {
            console.log("error in login", err);
            res.render("login", { err });
        });
}

///LOGOUT//////
app.get("/logout", function(req, res) {
    req.session = null;
    res.redirect("/login");
});

//PETITION
//USER TYPES IN DATA AND SUBMITS
app.get("/petition", (req, res) => {
    console.log("signature COOKIE: ", req.session);
    console.log("GET request to /petition happened!");
    console.log("req.session: ", req.session);
    // res.locals.csrfToken = req.csrfToken();
    if ("signatureId" in req.session) {
        res.redirect("/signed");
        return;
    }
    if (!("userId" in req.session)) {
        res.redirect("/login");
        return;
    }
    res.render("petition", {
        layout: "main"
    });
});
//GOES TO THANK YOU-PAGE
app.post("/petition", (req, res) => {
    //THEN (.then) STORING CURRENT ID IN THE COOKIES
    if (!("userId" in req.session)) {
        res.redirect("/login");
        return;
    }
    if (!("signatureId" in req.session)) {
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
    } else {
        res.redirect("/signed");
    }
});

//SIGNERS ROUTE
//USER SEES THANK YOU-PAGE
//THE SIGNATURE DATA IS TAKEN FROM DATABASE AND REBUILT INTO AN IMAGE
app.get("/signed", (req, res) => {
    console.log("GET request to /signed happened!");
    console.log("COOKIE SESSION: ", req.session);
    if (!("userId" in req.session)) {
        res.redirect("/login");
        return;
    }
    Promise.all([db.getSignature(req.session.signatureId), db.countRows()])
        .then(result => {
            // console.log("RESULT countRows: ", result[1][0].count);
            console.log("signature: ", result[0][0].signature);
            res.render("thanks", {
                layout: "main",
                output: result[0][0].signature,
                amountOfSubscribers: result[1][0].count
            });
        })
        .catch(err => console.log("error in signed", err));
});

//DELETE SIGNATURE
app.post("/signed/delete", (req, res) => {
    console.log("POST request to /signed/delete happened");
    if (!("userId" in req.session)) {
        res.redirect("/login");
        return;
    }
    db.deleteSignature(req.session.userId).then(() => {
        req.session.signatureId = null;
        delete req.session.signatureId;
        res.redirect("/petition");
    });
});

//LAST PAGE _ USER SEES LISTS OF SUBSCRIBERS
app.get("/signers", (req, res) => {
    console.log("GET request to /signers happened!");
    if (!("userId" in req.session)) {
        res.redirect("/login");
        return;
    }
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
    if (!("userId" in req.session)) {
        res.redirect("/login");
        return;
    }
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
