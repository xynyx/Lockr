// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV || "development";
const express = require("express");
const bodyParser = require("body-parser");
const sass = require("node-sass-middleware");
const app = express();
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  "/styles",
  sass({
    src: __dirname + "/styles",
    dest: __dirname + "/public/styles",
    debug: true,
    outputStyle: "expanded",
  })
);
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],
  })
);
app.use(methodOverride("_method"));
app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");
const passwordRoutes = require("./routes/passwords");
const indexRoutes = require("./routes/index");
const organizationRoutes = require("./routes/organizations");
const manageRoutes = require("./routes/manage");
const apiRoutes = require("./routes/api");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/users", usersRoutes(db));
// TODO: Remove at some point
app.use("/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above
app.use("/", indexRoutes(db));
app.use("/password", passwordRoutes(db));
app.use("/orgs", organizationRoutes(db));
app.use("/manage", manageRoutes(db));
app.use("/api", apiRoutes(db));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
