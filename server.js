/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
Name: Aaron RoyAlappat 
Student ID: 158515221 
Date: 03-21-2025
Cyclic Web App URL: https://a1e12d10-5ee0-4516-a7e7-8559bf574f61-00-1wn6z8g727bay.janeway.replit.dev/ 
GitHub Repository URL: https://github.com/aaronroy888/web322-app

********************************************************************************/ 


const express = require("express");
const path = require("path");
const storeService = require("./store-service");

const app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: "dalvtgrh4",
    api_key: "766619963289559",
    api_secret: "KhkzOhVgUN40_yPe2Z3vX96wXgo",
    secure: true
});

const exphbs = require('express-handlebars');

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

const Handlebars = require("./helpers");

const upload = multer();

app.post("/items/add", upload.single("featureImage"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    

        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }
    

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;

        console.log(req.body); 

        res.redirect("/items");
    }
});

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active"' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));

const PORT = process.env.PORT || 8080;

app.use(express.static("public"));

storeService.initialize().then(() => {

    console.log("Data initialized successfully. Version 4");

    app.get("/items", (req, res) => {
        if (req.query.category) {
            storeService.getItemsByCategory(req.query.category)
                .then((data) => res.json(data))
                .catch((err) => res.status(404).send(err));
        } else if (req.query.minDate) {
            storeService.getItemsByMinDate(req.query.minDate)
                .then((data) => res.json(data))
                .catch((err) => res.status(404).send(err));
        } else {
            storeService.getAllItems()
                .then((data) => res.json(data))
                .catch((err) => res.status(404).send(err));
        }

    });

    app.get("/item/:value", (req, res) => {
        storeService.getItemById(req.params.value)
            .then((data) => res.json(data))
            .catch((err) => res.status(404).send(err));
    });

    app.get("/shop", async (req, res) => {
        let viewData = {};
      
        try {
          let items = [];
      
          if (req.query.category) {
            items = await itemData.getPublishedItemsByCategory(req.query.category);
          } else {
            items = await itemData.getPublishedItems();
          }
      
          items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
      
          let item = items[0];
      
          viewData.items = items;
          viewData.item = item;
        } catch (err) {
          viewData.message = "no results";
        }
      
        try {
          let categories = await itemData.getCategories();
      
          viewData.categories = categories;
        } catch (err) {
          viewData.categoriesMessage = "no results";
        }
      
        res.render("shop", { data: viewData });
      });

    app.get("/categories", (req, res) => {
        storeService.getCategories()
        .then((data) => {
            if (data.length > 0) {
                res.render("categories", { categories: data });
            } else {
                res.render("categories", { message: "No categories found" });
            }
        })
        .catch((err) => res.render("categories", { message: "Error: " + err }));
    });

    app.post("/items/add", upload.single("featureImage"), (req, res) => {
        if (req.file) {
            let streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream(
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };
    
            async function upload(req) {
                let result = await streamUpload(req);
                console.log(result); 
                return result;
            }
    
            upload(req).then((uploaded) => {
                req.body.featureImage = uploaded.url; // Set the feature image URL
                storeService.addItem(req.body).then((newItem) => {
                    console.log("New item added:", newItem); // Log the newly added item for debugging
                    res.redirect("/items");
                }).catch((err) => {
                    console.error("Error adding item:", err);
                    res.status(500).send("Error adding item");
                });
            }).catch((error) => {
                console.error("Upload Error:", error);
                res.status(500).send("Error uploading image");
            });
        } else {
            req.body.featureImage = "";
            storeService.addItem(req.body).then((newItem) => {
                console.log("New item added:", newItem); // Log the newly added item for debugging
                res.redirect("/items");
            }).catch((err) => {
                console.error("Error adding item:", err);
                res.status(500).send("Error adding item");
            });
        }
    });

    app.get("/items/add", (req, res) => {
        res.render("addItem");
    });

    app.get("/", (req, res) => {
        res.redirect("/about")
    }); 
     
    app.get("/about", (req, res) => {
        res.render("about");
    });  

    app.get('/shop/:id', async (req, res) => {

        let viewData = {};
      
        try{
      
            let items = [];
      
            if(req.query.category){
                items = await itemData.getPublishedItemsByCategory(req.query.category);
            }else{
                items = await itemData.getPublishedItems();
            }
      
            items.sort((a,b) => new Date(b.itemDate) - new Date(a.itemDate));
      
            viewData.items = items;
      
        }catch(err){
            viewData.message = "no results";
        }
      
        try{
            viewData.item = await itemData.getItemById(req.params.id);
        }catch(err){
            viewData.message = "no results"; 
        }
      
        try{
            let categories = await itemData.getCategories();
      
            viewData.categories = categories;
        }catch(err){
            viewData.categoriesMessage = "no results"
        }
      
        res.render("shop", {data: viewData})
      });

    app.use(function(req, res, next) {
        let route = req.path.substring(1);
        app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
        app.locals.viewingCategory = req.query.category;
        next();
    });
    app.use((req, res) => {
        res.status(404).send("404! Page Not Found");
    });

    app.listen(PORT, () => {
        console.log(`Express HTTP server listening on port ${PORT}`);
    });

}).catch(err => {
    console.log("Failed to initialize store service:", err);
});
