const express = require("express");
const mongoose = require('mongoose');
const app = express();
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
const _ = require("lodash");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todoListDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item(
  {
    name: "Welcome To your TO-DO list"
  }
)

const item2 = new Item(
  {
    name: "Hit + Button to add new Item"
  }
)

const item3 = new Item(
  {
    name: "Delete By checking Out."
  }
);

const defaultItem = [item1, item2, item3];
/*Item.insertMany(defaultItem , function(err)
{
  if(err){
    console.log(err);
  }
  else
  {
    console.log("Items Iserted Successfully!");
  }
});*/

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {


  Item.find(function (err, doc) {

    if (doc.length === 0) {
      Item.insertMany(defaultItem, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Uploaded Successfully!");
        }
      })
      res.redirect("/");
    }
    else {
      res.render("index", { kindOfDay: "Today", newListItem: doc })
    };
  })


});


app.get("/:paramName", function (req, res) {
  const paraName = _.capitalize(req.params.paramName);

  List.findOne({ name: paraName }, function (err, foundOne) {
    if (!err) {
      if (foundOne) {

        res.render("index", { kindOfDay: foundOne.name, newListItem: foundOne.items })
      }
      else {
        const list = new List(
          {
            name: paraName,
            items: defaultItem
          }
        );
        list.save();
        res.redirect("/" + paraName);
      }
    }
  });

})




app.post("/", function (req, res) {
  var item = req.body.newItem;
  var listType = req.body.listName;
  const newitem = new Item(
    {
      name: item
    });

  if (listType === "Today") {
    newitem.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listType }, function (err, foundOne) {
      if (!err) {
        if (foundOne) {
          foundOne.items.push(newitem);
          foundOne.save();
          res.redirect("/" + listType);
        }
      }
    })
  }


})

app.post("/delete", function (req, res) {
  const itemId = req.body.checkbox;
  const listType = req.body.listype;

  if (listType === "Today") {
    Item.findByIdAndDelete({ _id: itemId }, function (err) {
      if (!err) {
        console.log("Successfully Deleted!");
        res.redirect("/");
      }
    })
  }

  else
  {
    List.findOneAndUpdate({name: listType}, {$pull: {items: {_id: itemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listType);
      }
    });
  }
})



app.listen(3000, function () {
  console.log("Server Have Been Started!");
})
