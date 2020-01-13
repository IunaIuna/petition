const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

//--------USERS TABLE-----------------
exports.registerUser = function(first, last, email, password) {
    return db.query(
        "INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id",
        [first, last, email, password]
    );
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
    return db.query(`SELECT signature FROM signatures WHERE id = ${currentId}`);
};

exports.countRows = function() {
    return db.query("SELECT COUNT (id) FROM signatures");
};

exports.showMeAllSigners = function() {
    return db.query("SELECT first, last FROM signatures");
};
