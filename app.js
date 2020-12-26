const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

mongoose.connect("mongodb://localhost:27017/todolistsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const itemSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});
const item2 = new Item({
  name: "Hit the + button to add a new item",
});
const item3 = new Item({
  name: "<- Hit the checkbox to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, (err, foundItems) => {
    const currentday = date.getDate();
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Default items are inserted successfully.");
        }
      });
      res.redirect("/");
    } else {
      res.render("index", {
        listTitle: "Today",
        newListItems: foundItems,
      });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.button;
  const item = new Item({ name: itemName });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, results) {
      results.items.push(item);
      results.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const deleteItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(deleteItemId, (err) => {
      console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, results) => {
      results.items.pull({ _id: deleteItemId });
      results.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:listName", function (req, res) {
  const customListName = _.capitalize(req.params.listName);

  List.findOne({ name: customListName }, function (err, result) {
    if (!err) {
      if (result === null) {
        const customList = new List({
          name: customListName,
          items: defaultItems,
        });
        customList.save();
        res.redirect("/" + customListName);
      } else {
        res.render("index", {
          listTitle: customListName,
          newListItems: result.items,
        });
      }
    } else {
      console.log(err);
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("server is running successfully.");
});
