const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

const connectionString = "mongodb+srv://Aaron_Roy_Alappat:MongoMango8@cluster0.9lg7v.mongodb.net/";

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(connectionString);

        db.on('error', (err) => {
            reject(err);
        });

        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            return reject("Passwords do not match");
        }

        let newUser = new User({
            userName: userData.userName,
            password: userData.password,
            email: userData.email,
            loginHistory: []
        });

        newUser.save()
            .then(() => resolve())
            .catch((err) => {
                if (err.code === 11000) {
                    reject("User Name already taken");
                } else {
                    reject("There was an error creating the user: " + err);
                }
            });
    });
};

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .then((users) => {
                if (users.length === 0) {
                    return reject("Unable to find user: " + userData.userName);
                }

                const user = users[0];

                if (user.password !== userData.password) {
                    return reject("Incorrect Password for user: " + userData.userName);
                }

                user.loginHistory.push({
                    dateTime: (new Date()).toString(),
                    userAgent: userData.userAgent
                });

                User.updateOne(
                    { userName: user.userName },
                    { $set: { loginHistory: user.loginHistory } }
                )
                    .then(() => resolve(user))
                    .catch((err) => reject("There was an error verifying the user: " + err));
            })
            .catch(() => {
                reject("Unable to find user: " + userData.userName);
            });
    });
};
