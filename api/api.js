//Creating API router
const express = require('express');
const apiRouter = express.Router();

//Routers
const employeeRouter = require('./employee');
apiRouter.use("/employees", employeeRouter);

const menuRouter = require('./menu');
apiRouter.use("/menus", menuRouter);


module.exports = apiRouter;