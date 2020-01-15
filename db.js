const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

//--------USERS TABLE-----------------
exports.registerUser = function(first, last, email, password) {
    return db.query(
        "INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id",
        [first, last, email, password]
    );
};

//LOGIN
exports.getInfoByEmail = function(mail) {
    return db
        .query(`SELECT password, id FROM users WHERE email = $1`, [mail])
        .then(pass => {
            console.log("hashed pass return by email db.js", pass.rows[0]);
            return pass.rows[0];
        });
};

//LOGIN - HAS THE USER ALREADY SIGNED THE PETITION?
exports.checkForSignatureId = function(user_ID) {
    console.log("user_ID looks like this::", user_ID);
    return db
        .query("SELECT id FROM signatures WHERE user_id = $1", [user_ID])
        .then(({ rows }) => {
            console.log("Rows in query: checkForSignatureId", rows);
            return rows;
        });
};
//---------SIGNATURE TABLE--------------
//FUNCTION TO PUT THE INPUT INFO INTO THE DATABASE

exports.addSignature = function(first, last, signature) {
    return db.query(
        "INSERT INTO signatures (first, last, signature) VALUES($1, $2, $3) RETURNING id",
        [
            // $1 for the safe
            first,
            last,
            signature
        ]
    );
};

//FUNCTION TO GET THE IMAGE STRING OUT OF THE DATABASE
exports.getSignature = function(currentId) {
    return db.query(`SELECT signature FROM signatures WHERE id = $1`, [
        currentId
    ]);
};

exports.countRows = function() {
    return db.query("SELECT COUNT (id) FROM signatures");
};

exports.showMeAllSigners = function() {
    return db.query("SELECT first, last FROM signatures").then(({ rows }) => {
        console.log("ROWS", rows);
        return rows;
    });
};
