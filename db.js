const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

exports.addUser = function(first, last, signature) {
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

// exports.addCity = function(name, country, population) {
//     return db.query(
//         "INSERT INTO cities (city, country, population) VALUES($1, $2, $3)", // $1 for the safe
//         [name, country, population]
//     );
// };
//
// exports.getCities = function() {
//     return db
//         .query("SELECT id, population FROM cities")
//         .then(({ rows }) => console.log(rows));
// };
