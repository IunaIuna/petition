DROP TABLE IF EXISTS users;

CREATE TABLE users(
  id SERIAL PRIMARE KEY,
  first VARCHAR NOT NULL CHECK (first != ""),
  last VARCHAR NOT NULL CHECK (last != ""),
  email VARCHAR NOT NULL UNIQUE CHECK (email != ""),
  password VARCHAR NOT NULL CHECK (password != "")
);
