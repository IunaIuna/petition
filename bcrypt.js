const bcrypt = require("bcryptjs");
let { genSalt, hash, compare } = bcrypt;
const { promisify } = require("util");

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

module.exports.compare = compare;

module.exports.hash = plainTextPass =>
    genSalt().then(salt => hash(plainTextPass, salt));

//DEMONSTRATION
// genSalt()
//     .then(salt => {
//         //here is salt is shown
//         console.log(salt);
//         hash("monkey", salt);
//     })
//     .then(hashedPass => {
//         //here is hash with the salt is shown
//         console.log(hashedPass);
//         return compare("monkeys, hashedPass");
//     })
//     .then(console.log(val));
