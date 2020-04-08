//Creating router
const express = require('express');
const timesheetsRouter = express.Router({ mergeParams: true });

//Connection DB
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//PARAM
timesheetsRouter.param("timesheetId", (req, res, next, timesheetId) => {
    db.get("SELECT * FROM Timesheet WHERE id = $id", { $id: timesheetId }, (err, timesheet) => {
        if (err) { next(err); }
        else if (!timesheet) { res.sendStatus(404); }
        else {
            req.timesheet = timesheet;
            next();
        }
    });
});

//GET
timesheetsRouter.get("/", (req, res, next) => {
    db.all("SELECT * FROM Timesheet WHERE employee_id = $employeeId", { $employeeId: req.employee.id }, (err, timesheets) => {
        if (err) { next(err); }
        else { res.send({ timesheets: timesheets }); }
    });
});

//POST
timesheetsRouter.post("/", (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    if (!hours || !rate || !date) { res.sendStatus(400); }
    else {
        const sqlQ = "INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId);";
        const values = { $hours: hours, $rate: rate, $date: date, $employeeId: req.employee.id };
        db.run(sqlQ, values, function (err) {
            if (err) { next(err); }
            else {
                db.get("SELECT * FROM Timesheet WHERE id = $timesheetId", { $timesheetId: this.lastID }, (err, timesheet) => {
                    if (err) { next(err); }
                    else {
                        res.status(201).send({ timesheet: timesheet });
                    }
                });
            }
        });
    }
});


//PUT
timesheetsRouter.put("/:timesheetId", (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    if (!hours || !rate || !date) { res.sendStatus(400); }
    else {
        const sqlQ = "UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE id = $timesheetId";
        const values = { $hours: hours, $rate: rate, $date: date, $timesheetId: req.params.timesheetId };
        db.run(sqlQ, values, (err) => {
            if (err) { next(err); }
            else {
                db.get("SELECT * FROM Timesheet WHERE id = $timesheetId", { $timesheetId: req.params.timesheetId }, (err, timesheet) => {
                    if (err) { next(err); }
                    else { res.send({ timesheet: timesheet }); }
                });
            }
        });
    }
});

//DELETE
timesheetsRouter.delete("/:timesheetId", (req, res, next) => {
    db.run("DELETE FROM Timesheet WHERE id = $timesheetId", { $timesheetId: req.params.timesheetId }, (err) => {
        if (err) { next(err); }
        else {
            res.sendStatus(204);
        }
    });
});

module.exports = timesheetsRouter;