//peppermint-petition.index.js
const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
// const csurf = require("csurf");
//const cp = require('cookie-parser');
//cookie-parser is gone! we now use use cookie-session

const cookieSession = require("cookie-session");

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

// app.surf(csurf());

//ROUTES
//////////////////////////////////////
//Launch Main Page: Petition
app.get("/", (req, res) => {
    console.log("GET PETITION request to / happened!");
    console.log("req.session: ", req.session);
    // res.locals.csrfToken = req.csrfToken();
    res.render("home", {
        layout: "main"
    });
});

app.post("/", (req, res) => {
    db.addUser(req.body.first, req.body.last, "ghghg");
    console.log("POST PETITION request to / happened!");
    console.log(req.body);
    res.redirect("/signed");
});

app.get("/signed", (req, res) => {
    console.log("GET THANKS request to / happened!");
    res.render("thanks", {
        layout: "main"
    });
});

//
// app.get("/", (req, res) => {
//     console.log("GET SIGNERS request to / happened!");
//     res.render("welcome", {
//         layout: "main"
//     });
// });

app.listen(8080, () => console.log("port 8080 listening ..."));
