//Creating router
const express = require('express');
const menuRouter = express.Router();

//Connection DB
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//Routers
const menuItemsRouter = require('./menuItems');
menuRouter.use("/:menuId/menu-items", menuItemsRouter);

//PARAM
menuRouter.param(":menuId", (req, res, next, menuId) => {
    db.get("SELECT * FROM Menu WHERE id = $menuId", { $menuId: menuId }, (err, menu) => {
        if (err) { next(err); }
        else if (!menu) { res.sendStatus(404); }
        else {
            req.menu = menu; next();
        }
    });
});

//GET
menuRouter.get("/", (req, res, next) => {
    db.all("SELECT * FROM Menu", (err, menus) => {
        if (err) { next(err); }
        else { res.send({ menus: menus }); }
    });
});

menuRouter.get("/:menuId", (req, res, next) => {
    res.send({ menu: req.menu });
})

//POST
menuRouter.post("/", (req, res, next) => {
    const title = req.body.menu.title;

    if (!title) { res.sendStatus(400); }
    else {
        const sqlQ = "INSERT INTO Menu (title) VALUES ($title)";
        const values = { $title: title };
        db.run(sqlQ, values, function (err) {
            if (err) { next(err); }
            else {
                db.get("SELECT * FROM Menu WHERE id = $menuId", { $menuId: this.lastID }, (err, menu) => {
                    if (err) { next(err); }
                    else {
                        res.status(201).send({ menu: menu });
                    }
                });
            }
        });
    }
});

//PUT
menuRouter.put("/:menuId", (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) { res.sendStatus(400); }
    else {
        const sqlQ = "UPDATE Menu SET title = $title WHERE id = $menuId";
        const values = { $title: title, $menuId: req.params.menuId };
        db.run(sqlQ, values, (err) => {
            if (err) { next(err); }
            else {
                db.get("SELECT * FROM Menu WHERE id = $menuId", { $menuId: req.params.menuId }, (err, menu) => {
                    if (err) { next(err); }
                    else {
                        res.send({ menu: menu });
                    }
                });
            }
        });

    }
});

//DELETE
menuRouter.delete("/:menuId", (req, res, next) => {
    db.get("SELECT * FROM MenuItem WHERE menu_id = $menuId", { $menuId: req.params.menuId }, (err, menuItem) => {
        if (err) { next(err); }
        else if (menuItem) { res.sendStatus(400); }
        else {
            db.run("DELETE FROM Menu WHERE id = $menuId", { $menuId: req.params.menuId }, (err) => {
                if (err) { next(err); }
                else { res.sendStatus(204); }
            })
        }
    })
})


module.exports = menuRouter;