/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
Name: Aaron RoyAlappat 
Student ID: 158515221 
Date: 03-05-2025
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

const PORT = process.env.PORT || 8080;

app.use(express.static("public"));

storeService.initialize().then(() => {

    console.log("Data initialized successfully. Version 3");

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

    app.get("/shop", (req, res) => {
        storeService.getPublishedItems()
        .then(data => res.json(data))
        .catch(err => res.status(404).send(err));
    });

    app.get("/categories", (req, res) => {
        storeService.getCategories()
        .then(data => res.json(data))
        .catch(err => res.status(404).send(err));
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
        res.sendFile(path.join(__dirname, "views", "addItem.html"));
    });

    app.get("/", (req, res) => {
        res.redirect("/about")
    }); 
     
    app.get("/about", (req, res) => {
        res.sendFile(path.join(__dirname, "views", "about.html"));
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
