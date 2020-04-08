//Creating router
const express = require('express');
const employeeRouter = express.Router();

//Connection DB
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//Routers
const timesheetsRouter = require('./timesheets');
employeeRouter.use("/:employeeId/timesheets", timesheetsRouter);

//PARAM
employeeRouter.param("employeeId", (req, res, next, employeeId) => {
    db.get("SELECT * FROM Employee WHERE id = $id", { $id: employeeId }, (err, employee) => {
        if (err) { next(err); }
        else if (!employee) { res.sendStatus(404); }
        else { req.employee = employee; next(); }
    });
});

//GET
employeeRouter.get("/", (req, res, next) => {
    db.all("SELECT * FROM Employee WHERE is_current_employee = 1", (err, employees) => {
        if (err) { next(err); }
        else { res.send({ employees: employees }); }
    });
});

employeeRouter.get("/:employeeId", (req, res, next) => {
    res.send({ employee: req.employee });
});

//PUT
employeeRouter.put("/:employeeId", (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee ? 1 : 0;

    if (!name || !position || !wage) { res.sendStatus(400); }
    else {
        const sqlQ = "UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $id";
        const values = { $name: name, $position: position, $wage: wage, $isCurrentEmployee: isCurrentEmployee, $id: req.params.employeeId };
        db.run(sqlQ, values, (err) => {
            if (err) { next(err); }
            else {
                db.get("SELECT * FROM Employee WHERE id = $id", { $id: req.params.employeeId }, (err, employee) => {
                    if (err) { next(err); }
                    else { res.send({ employee: employee }); }
                });
            }
        });
    }
});

//POST
employeeRouter.post("/", (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const isCurrentEmployee = 1;

    if (!name || !position || !wage) { res.sendStatus(400); }
    else {
        //const sqlQ = `INSERT INTO Employee (name, position, wage, is_current_employee) VALUES (${name}, ${position}, ${wage}, ${isCurrentEmployee})`;
        const sqlQ = "INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)";
        const values = { $name: name, $position: position, $wage: wage, $isCurrentEmployee: isCurrentEmployee };

        db.run(sqlQ, values, function (err) {
            if (err) { next(err); }
            else {
                db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) => {
                    if (err) { next(err) }
                    else { res.status(201).send({ employee: employee }); }
                });
            }
        });
    }
});

//DELETE 
employeeRouter.delete("/:employeeId", (req, res, next) => {
    db.run("UPDATE Employee SET is_current_employee = 0 WHERE id = $id", { $id: req.params.employeeId }, (err) => {
        if (err) { next(err); }
        else {
            db.get("SELECT * FROM Employee WHERE id = $id", { $id: req.params.employeeId }, (err, employee) => {
                if (err) { next(err); }
                else { res.send({ employee: employee }); }
            })
        }
    })
});


module.exports = employeeRouter;