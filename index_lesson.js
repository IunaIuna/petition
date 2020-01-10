const db = require("./db");

db.addCity("Funky Town", "Funkyland", 16).then(function() {
    return db.getCities();
});

db.getCities().then(data => console.log(data));
// we need to set express for comment with app.get
