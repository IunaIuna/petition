DROP TABLE IF EXISTS users;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  first VARCHAR NOT NULL UNIQUE CHECK (first != ''),
  last VARCHAR NOT NULL UNIQUE CHECK (last != ''),
  email VARCHAR NOT NULL UNIQUE CHECK (email != ''),
  password VARCHAR NOT NULL CHECK (password != '')
);
