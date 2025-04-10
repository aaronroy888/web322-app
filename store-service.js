const Sequelize = require('sequelize');
const { Op } = Sequelize;
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'npg_NyfTH24Mhejp', {
    host: 'ep-cold-breeze-a5sm957s-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

const Category = sequelize.define('Category', {
    category: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

const Item = sequelize.define('Item', {
    body: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    postDate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    featureImage: {
        type: Sequelize.STRING
    },
    published: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    }
});

Item.belongsTo(Category, { foreignKey: 'category' });

sequelize.sync()
    .then(() => {
        console.log("Models are synced successfully.");
    })
    .catch((error) => {
        console.error("Error syncing models: ", error);
    });

module.exports = {
    initialize() {
        return new Promise((resolve, reject) => {
            sequelize.sync()  
                .then(() => {
                    console.log("Database synced successfully");
                    resolve(); 
                })
                .catch((error) => {
                    console.error("Error syncing database: ", error);
                    reject("Unable to sync the database");  // Reject the promise if an error occurs
                });
        });
    },

    getAllItems() {
        return new Promise((resolve, reject) => {
            Item.findAll()
                .then((items) => {
                    if (items.length > 0) {
                        resolve(items);
                    } else {
                        reject("No results returned");  // If no items are found, reject the promise
                    }
                })
                .catch((error) => {
                    console.error("Error retrieving items: ", error);
                    reject("No results returned");
                });
        });
    }
    ,

    getPublishedItems() {
        return new Promise((resolve, reject) => {
            // Find all items where `published` is true
            Item.findAll({
                where: {
                    published: true
                }
            })
            .then((publishedItems) => {
                // If successful, resolve with the list of published items
                if (publishedItems.length > 0) {
                    resolve(publishedItems);
                } else {
                    // If no items are found, reject with a message
                    reject("No published items found.");
                }
            })
            .catch((error) => {
                // If there’s an error in the operation, reject with an error message
                console.error("Error fetching published items: ", error);
                reject("No results returned");
            });
        });
    }
    ,

    getCategories() {
        return new Promise((resolve, reject) => {
            // Find all categories
            Category.findAll()
            .then((categories) => {
                // If successful, resolve with the list of categories
                if (categories.length > 0) {
                    resolve(categories);
                } else {
                    // If no categories are found, reject with a message
                    reject("No categories found.");
                }
            })
            .catch((error) => {
                // If there’s an error in the operation, reject with an error message
                console.error("Error fetching categories: ", error);
                reject("No results returned");
            });
        });
    }
    ,

    addItem(itemData) {
        return new Promise((resolve, reject) => {
            // 1. Set the `published` property properly
            itemData.published = (itemData.published) ? true : false;
    
            // 2. Set empty values to null
            for (let key in itemData) {
                if (itemData[key] === "") {
                    itemData[key] = null;
                }
            }
    
            // 3. Set the `postDate` to the current date
            itemData.postDate = new Date();
    
            // 4. Create the new item in the database
            Item.create(itemData)
                .then((newItem) => {
                    resolve(newItem);  // Successfully created the item
                })
                .catch((error) => {
                    console.error("Error creating item: ", error);
                    reject("Unable to create post");  // Reject if there was an error
                });
        });
    }
    ,

    getItemsByCategory(category) {
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: {
                    categoryId: category  // Filter items by the specified category
                }
            })
            .then((items) => {
                if (items.length > 0) {
                    resolve(items);  // Resolve with the filtered items
                } else {
                    reject("No results returned for this category");  // Reject if no items found for the category
                }
            })
            .catch((error) => {
                console.error("Error retrieving items by category: ", error);
                reject("No results returned");  // Reject if there is an error during retrieval
            });
        });
    }
    ,

    
getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                postDate: {
                    [Op.gte]: new Date(minDateStr)  // Use the "greater than or equal" operator
                }
            }
        })
        .then((items) => {
            if (items.length > 0) {
                resolve(items);  // Resolve with the filtered items
            } else {
                reject("No results returned for the given date");  // Reject if no items found
            }
        })
        .catch((error) => {
            console.error("Error retrieving items by date: ", error);
            reject("No results returned");  // Reject if there is an error during retrieval
        });
    });
},

getItemById(id) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                id: id  // Filter by the item ID
            }
        })
        .then((data) => {
            if (data.length > 0) {
                resolve(data[0]);  // Resolve with the first item in the array
            } else {
                reject("No results returned for the given ID");  // Reject if no item is found
            }
        })
        .catch((error) => {
            console.error("Error retrieving item by ID: ", error);
            reject("No results returned");  // Reject if there is an error during retrieval
        });
    });
}
,

getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        // Find all items that are published and belong to the given category
        Item.findAll({
            where: {
                published: true,
                category: category
            }
        })
        .then((publishedItemsByCategory) => {
            // If successful, resolve with the filtered list of items
            if (publishedItemsByCategory.length > 0) {
                resolve(publishedItemsByCategory);
            } else {
                // If no items are found, reject with a message
                reject("No published items found in this category.");
            }
        })
        .catch((error) => {
            // If there’s an error in the operation, reject with an error message
            console.error("Error fetching published items by category: ", error);
            reject("No results returned");
        });
    });
},

addCategory(categoryData) {
    return new Promise((resolve, reject) => {
        // Step 1: Set empty values to null
        for (let key in categoryData) {
            if (categoryData[key] === "") {
                categoryData[key] = null;
            }
        }

        // Step 2: Create the new category in the database
        Category.create(categoryData)
            .then((newCategory) => {
                resolve(newCategory);  // Successfully created the category
            })
            .catch((error) => {
                console.error("Error creating category: ", error);
                reject("Unable to create category");  // Reject if there was an error
            });
    });
},

deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        // Attempt to delete the category by ID
        Category.destroy({
            where: { id: id }
        })
        .then((deletedCount) => {
            // If deletedCount is greater than 0, it means the category was deleted
            if (deletedCount > 0) {
                resolve("Category deleted successfully");
            } else {
                reject("No category found with the given ID");
            }
        })
        .catch((error) => {
            console.error("Error deleting category: ", error);
            reject("Unable to delete category");
        });
    });
},

deletePostById(id) {
    return new Promise((resolve, reject) => {
        // Attempt to delete the post by ID
        Item.destroy({
            where: { id: id }
        })
        .then((deletedCount) => {
            // If deletedCount is greater than 0, it means the post was deleted
            if (deletedCount > 0) {
                resolve("Post deleted successfully");
            } else {
                reject("No post found with the given ID");
            }
        })
        .catch((error) => {
            console.error("Error deleting post: ", error);
            reject("Unable to delete post");
        });
    });
},

    Item,
    Category
};