//App creation
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

//Middleware 
const errorhandler = require('errorhandler');
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(errorhandler());
app.use(cors());

//Routers
const apiRouter = require('./api/api');
app.use("/api", apiRouter);

//Starting server
app.listen(PORT, () => console.log("Listening on PORT: " + PORT));


module.exports = app;