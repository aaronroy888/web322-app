/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
Name: Aaron RoyAlappat 
Student ID: 158515221 
Date: 04-09-2025
Cyclic Web App URL:  https://c7ebe2c4-74d0-4812-b3eb-fe70e300e79e-00-2bk31i2uns5yk.riker.replit.dev/
GitHub Repository URL: https://github.com/aaronroy888/web322-app
*
********************************************************************************/ 

const express = require("express");
const path = require("path");
const storeService = require("./store-service");
const authData = require('./auth-service');
const clientSessions = require("client-sessions");

const app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

app.use(clientSessions({
    cookieName: "session", 
    secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQrHJH58DBQKAjaajsdajkJK', // rage keyboarding
    duration: 30 * 60 * 1000,
    activeDuration: 1000 * 60 
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}


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

storeService.initialize()
.then(authData.initialize)
.then(() => {

    console.log("Data initialized successfully. Version 6");

    app.get("/login", (req, res) => {
        res.render("login");
    });
    
    app.get("/register", (req, res) => {
        res.render("register");
    });
    
    app.post("/register", (req, res) => {
        authData.registerUser(req.body).then(() => {
            res.render("register", { successMessage: "User created" });
        }).catch((err) => {
            res.render("register", { errorMessage: err, userName: req.body.userName });
        });
    });
    
    app.post("/login", (req, res) => {
        req.body.userAgent = req.get('User-Agent');
        authData.checkUser(req.body).then((user) => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            };
            res.redirect("/items");
        }).catch((err) => {
            res.render("login", { errorMessage: err, userName: req.body.userName });
        });
    });
    
    app.get("/logout", (req, res) => {
        req.session.reset();
        res.redirect("/");
    });
    
    app.get("/userHistory", ensureLogin, (req, res) => {
        res.render("userHistory");
    });    

    app.get("/items", ensureLogin, (req, res) => {
        if (req.query.category) {
            storeService.getItemsByCategory(req.query.category)
                .then((data) => {
                    if (data.length > 0) {
                        res.render("Items", { Items: data });
                    } else {
                        res.render("Items", { message: "No results" });
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
    

    app.get("/item/:value", ensureLogin, (req, res) => {
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

      app.get("/categories", ensureLogin, (req, res) => {
        storeService.getCategories()
            .then((data) => {
                if (data.length > 0) {
                    res.render("categories", { categories: data }); 
                } else {
                    res.render("categories", { message: "No results" }); 
                }
            })
            .catch((err) => {
                console.error(err);
                res.render("categories", { message: "Error fetching categories" });  
            });
    });

    app.get("/categories/add", ensureLogin, (req, res) => {
        res.render("addCategory"); 
    });

    app.post("/categories/add", ensureLogin, (req, res) => {
        storeService.addCategory(req.body) 
            .then(() => {
                res.redirect("/categories");
            })
            .catch((err) => {
                console.error("Error adding category:", err);
                res.status(500).send("Error adding category");
            });
    });

    app.get("/categories/delete/:id", ensureLogin, (req, res) => {
        storeService.deleteCategoryById(req.params.id) 
            .then(() => {
                res.redirect("/categories"); 
            })
            .catch((err) => {
                console.error("Error deleting category:", err);
                res.status(500).send("Error deleting category");
            });
    });

    app.get("/items/delete/:id", ensureLogin, (req, res) => {
        storeService.deletePostById(req.params.id) 
            .then(() => {
                res.redirect("/items"); 
            })
            .catch((err) => {
                console.error("Error deleting post:", err);
                res.status(500).send("Error deleting post");
            });
    });
    

    app.post("/items/add", ensureLogin, upload.single("featureImage"), (req, res) => {
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
                req.body.featureImage = uploaded.url;
                storeService.addItem(req.body).then((newItem) => {
                    console.log("New item added:", newItem); 
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
                console.log("New item added:", newItem);
                res.redirect("/items");
            }).catch((err) => {
                console.error("Error adding item:", err);
                res.status(500).send("Error adding item");
            });
        }
    });

    app.get("/items/add", ensureLogin, (req, res) => {
        storeService.getCategories()
            .then((categories) => {
                res.render("addItem", { categories: categories });
            })
            .catch((err) => {
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
        console.log(`Express HTTP server listening on port`, PORT);
    });

}).catch(err => {
    console.log("unable to start server: " , err);
});
