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
        .query("SELECT password, id FROM users WHERE email = $1", [mail])
        .then(pass => {
            return pass.rows[0];
        });
};

//LOGIN - HAS THE USER ALREADY SIGNED THE PETITION?
exports.checkForSignatureId = function(user_id) {
    console.log("user_ID: ", user_id);
    return db
        .query("SELECT id FROM signatures WHERE user_id = $1", [user_id])
        .then(({ rows }) => {
            return rows;
        });
};

//PROFILE
exports.setProfile = function(age, city, url, user_id) {
    return db.query(
        "INSERT INTO user_profiles(age, city, url, user_id) VALUES ($1,$2, $3, $4)",
        [age || null, city, url || null, user_id]
    );
};

////////////////////EDIT PROFILE//////////////////////////////////
////EDIT: CONCERNS USER TABLE
exports.getCurrentProfileInfo = function(user_id) {
    return db
        .query(
            "SELECT first, last, age, email, city, url, password FROM users JOIN user_profiles ON users.id = user_profiles.user_id WHERE users.id = $1",
            [user_id]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.updateThreeColumns = function(first, last, email, user_id) {
    return db.query(
        "UPDATE users SET first = $1, last =$2, email = $3 WHERE users.id = $4",
        [first, last, email || null, user_id]
    );
    // .then(({ rows }) => {
    //     return rows;
    // });
};

exports.updateFourColumns = function(first, last, email, password, user_id) {
    return db.query(
        "UPDATE users SET first = $1, last =$2, email = $3, password = $4 WHERE users.id = $5",
        [first, last, email, password, user_id]
    );
    // .then(({ rows }) => {
    //     return rows;
    // });
};
/////EDIT: CONCERNS USER-PROFILES table
exports.editUserProfilesInfo = function(age, city, url, user_id) {
    console.log("user_id ", user_id);
    return db
        .query(
            "INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age = $1, city = $2, url = $3 RETURNING *",
            [age || null, city, url, user_id]
        )
        .then(({ rows }) => {
            return rows;
        });
};
//---------SIGNATURE TABLE--------------
//FUNCTION TO PUT THE INPUT INFO INTO THE DATABASE
exports.addSignature = function(signature, user_id) {
    return db.query(
        "INSERT INTO signatures (signature, user_ID) VALUES($1, $2) RETURNING id",
        [signature, user_id]
    );
};

//FUNCTION TO GET THE IMAGE STRING OUT OF THE DATABASE
exports.getSignature = function(currentId) {
    return db
        .query("SELECT signature FROM signatures WHERE id = $1", [currentId])
        .then(({ rows }) => {
            return rows;
        });
};

//DELETE signature
exports.deleteSignature = function(user_id) {
    return db.query("DELETE FROM signatures WHERE user_id = $1", [user_id]);
};

///???
exports.countRows = function() {
    return db.query("SELECT COUNT (id) FROM signatures").then(({ rows }) => {
        return rows;
    });
};

// exports.showMeAllSigners = function() {
//     return db.query("SELECT first, last FROM users").then(({ rows }) => {
//         console.log("ROWS", rows);
//         return rows;
//     });
// };
//FOR SIGNERS LIST - ALL AND BY CITY
exports.dataFromThreeTables = function() {
    return db
        .query(
            "SELECT users.id, first, last, age, city, url, signature FROM users JOIN signatures ON users.id = signatures.user_id JOIN user_profiles ON users.id = user_profiles.user_id"
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.getSignersByCity = function(city) {
    return db
        .query(
            "SELECT users.id, first, last, age FROM users JOIN signatures ON users.id = signatures.user_id JOIN user_profiles ON users.id = user_profiles.user_id WHERE LOWER(city) = LOWER($1)",
            [city]
        )
        .then(({ rows }) => {
            return rows;
        });
};
