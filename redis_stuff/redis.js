const redis = require("redis");
const { promisify } = require("util");

const client = redis.createClient({
    host: "localhost",
    port: 6379
});

client.on("error", function(err) {
    console.log(err);
});

exports.setex = promisify(client.setex.bind(client));
