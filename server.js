/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
Name: Aaron RoyAlappat 
Student ID: 158515221 
Date: 04-09-2025
Cyclic Web App URL:  
GitHub Repository URL: https://github.com/aaronroy888/web322-app
*
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
                .then((data) => {
                    if (data.length > 0) {
                        res.render("Items", { Items: data });  // Render items if there is data
                    } else {
                        res.render("Items", { message: "No results" });  // Render "no results" message
                    }
                })
                .catch((err) => {
                    console.error(err);
                    res.render("Items", { message: "Error fetching items by category" });
                });
        } else if (req.query.minDate) {
            storeService.getItemsByMinDate(req.query.minDate)
                .then((data) => {
                    if (data.length > 0) {
                        res.render("Items", { Items: data });
                    } else {
                        res.render("Items", { message: "No results" });
                    }
                })
                .catch((err) => {
                    console.error(err);
                    res.render("Items", { message: "Error fetching items by date" });
                });
        } else {
            storeService.getAllItems()
                .then((data) => {
                    if (data.length > 0) {
                        res.render("Items", { Items: data });
                    } else {
                        res.render("Items", { message: "No results" });
                    }
                })
                .catch((err) => {
                    console.error(err);
                    res.render("Items", { message: "Error fetching all items" });
                });
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
                    res.render("categories", { categories: data });  // Render categories if there is data
                } else {
                    res.render("categories", { message: "No results" });  // Render "no results" message
                }
            })
            .catch((err) => {
                console.error(err);
                res.render("categories", { message: "Error fetching categories" });  // Render error message
            });
    });

    app.get("/categories/add", (req, res) => {
        res.render("addCategory");  // Create an 'addCategory.hbs' file with a form for adding categories.
    });

    app.post("/categories/add", (req, res) => {
        storeService.addCategory(req.body)  // Assuming `storeService.addCategory` is implemented correctly
            .then(() => {
                res.redirect("/categories");  // Redirect to the categories page after a successful addition
            })
            .catch((err) => {
                console.error("Error adding category:", err);
                res.status(500).send("Error adding category");
            });
    });

    app.get("/categories/delete/:id", (req, res) => {
        storeService.deleteCategoryById(req.params.id)  // Assuming `deleteCategoryById` is implemented in `storeService`
            .then(() => {
                res.redirect("/categories");  // Redirect to the categories page after deleting
            })
            .catch((err) => {
                console.error("Error deleting category:", err);
                res.status(500).send("Error deleting category");
            });
    });

    app.get("/items/delete/:id", (req, res) => {
        storeService.deletePostById(req.params.id)  // Assuming `deletePostById` is implemented in `storeService`
            .then(() => {
                res.redirect("/items");  // Redirect to the items page after deleting
            })
            .catch((err) => {
                console.error("Error deleting post:", err);
                res.status(500).send("Error deleting post");
            });
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
        storeService.getCategories()
            .then((categories) => {
                // Render the addItem view and pass the categories data
                res.render("addItem", { categories: categories });
            })
            .catch((err) => {
                // Render the addItem view with an empty categories array if there's an error
                console.error("Error fetching categories:", err);
                res.render("addItem", { categories: [] });
            });
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
