//Creating router
const express = require('express');
const menuItemsRouter = express.Router({ mergeParams: true });

//Connection DB
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//PARAM
menuItemsRouter.param("menuItemId", (req, res, next, menuItemId) => {
    db.get("SELECT * FROM MenuItem WHERE id = $menuItemId", { $menuItemId: menuItemId }, (err, menuItem) => {
        if (err) { next(err); }
        else if (!menuItem) { res.sendStatus(404); }
        else {
            req.menuItem = menuItem;
            next();
        }
    })
})

//GET
menuItemsRouter.get("/", (req, res, next) => {
    db.all("SELECT * FROM MenuItem WHERE menu_id = $menuId", { $menuId: req.menu.id }, (err, menuItems) => {
        if (err) { next(err); }
        else { res.send({ menuItems: menuItems }); }
    });
});

//PUT
menuItemsRouter.put("/:menuItemId", (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;

    if (!name || !inventory || !price) { res.sendStatus(400); }
    else {
        const sqlQ = "UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE id = $menuItemId";
        const values = { $name: name, $description: description, $inventory: inventory, $price: price, $menuItemId: req.params.menuItemId };
        db.run(sqlQ, values, (err) => {
            if (err) { next(err); }
            else {
                db.get("SELECT * FROM MenuItem WHERE id = $menuItemId", { $menuItemId: req.params.menuItemId }, (err, menuItem) => {
                    if (err) { next(err); }
                    else { res.send({ menuItem: menuItem }); }
                });
            }
        });
    }
});

//POST
menuItemsRouter.post("/", (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;

    if (!name || !inventory || !price) { res.sendStatus(400); }
    else {
        const sqlQ = "INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id);";
        const values = { $name: name, $description: description, $inventory: inventory, $price: price, $menu_id: req.menu.id };
        db.run(sqlQ, values, function (err) {
            if (err) { next(err); }
            else {
                db.get("SELECT * FROM MenuItem WHERE id = $menuItemId", { $menuItemId: this.lastID }, (err, menuItem) => {
                    if (err) { next(err); }
                    else {
                        res.status(201).send({ menuItem: menuItem });
                    }
                });
            }
        });
    }
});

//DELETE
menuItemsRouter.delete("/:menuItemId", (req, res, next) => {
    db.run("DELETE FROM MenuItem WHERE id = $menuItemId", { $menuItemId: req.params.menuItemId }, (err) => {
        if (err) { next(err); }
        else { res.sendStatus(204); }
    });
});


module.exports = menuItemsRouter;