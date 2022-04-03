const express = require("express");
const userRoutes = express.Router();
const { ObjectId } = require("mongodb");
require("express-group-routes");
var objectId = require("mongodb").ObjectId;
var jwt = require('jsonwebtoken');


const User = require("../services/user.service");
function verifyToken(req, res, next) {

    try {
        if (req.headers.authorization !== undefined) {
            const bearerTokenHeader = req.headers.authorization;
            const bearerToken = bearerTokenHeader.split(" ");
            const token = bearerToken[1];
            data = jwt.verify(token, "nu-one");
            next();
        } else {
            res.status(403).send({
                message: "Invalid request",
                statusCode: 403,
                error: "Authorization token is missing"
            })
        }

    } catch (e) {
        res.status(403).send({
            message: e.message,
            statusCode: 403,
            data: []
        })
    }
}
userRoutes.group('/user/', (router) => {
    router.get("/:userId", verifyToken, async function (req, res) {
        try {
            let data = await User.find({ "_id": req.params.userId })
            if (!data) {
                res.status(404).send({
                    message: `Unable to find user registered with the ID:${req.params.userId}`,
                    statusCode: 404,
                    data: data,
                });
            } else {
                res.json({
                    message: `Found user registered with the ID:${req.params.userId}`,
                    statusCode: 200,
                    data: data,
                });
            }
        } catch ($e) {
            res.status(500).send({
                message: "Something terrible happened. Please contact support",
                statusCode: 500,
                data: []
            })
        }
    });
    router.delete("/:userId", verifyToken, async function (req, res) {
        try {
            let data = await User.deleteOne({
                "_id": ObjectId(req.params.userId)
            })
            if (data.deletedCount == 0) {
                res.status(404).send({
                    message: `Unable to remove user registered with the ID:${req.params.userId}`,
                    statusCode: 404,
                    data: data,
                });
            } else {
                res.json({
                    message: `User (ID:${req.params.userId}) Removed from system. `,
                    statusCode: 200,
                    data: data,
                });
            }
        } catch (e) {
            res.status(500).send({
                message: "Something terrible happened. Please contact support",
                statusCode: 500,
                data: []
            })
        }
    });
    router.post("/", verifyToken, async function (req, res, next) {

        try {
            const newUser = new User(req.body);
            let error = newUser.validateSync();
            if (error) {
                res.status(400).send(
                    { message: error._message, statusCode: 400, errors: error.errors });
                return;
            }
            let data = await newUser.save()
            if (!data) {
                res.status(400).send({
                    message: `Unable to create user`,
                    statusCode: 400,
                    data: data,
                });
            } else {
                res.status(200).send({
                    message: `User created with user ID:${newUser._id}`,
                    statusCode: 200,
                    data: data,
                });
            }
        } catch (e) {
            res.status(500).send({
                message: "Something terrible happened. Please contact support",
                statusCode: 500,
                data: []
            })
        }
    });
    router.put('/:userId', verifyToken, async function (req, res, next) {
        try {
            User.updateOne({ "_id": req.params.userId }, req.body, function (err, data) {
                if (err) {
                    res.status(400).send(
                        {
                            "message": err.message,
                            "statusCode": 400,
                            "errors": err
                        }
                    );
                    return;
                }
                res.json({
                    message: "user updated successfully",
                    statusCode: 201,
                    data: data
                });
            })



        } catch (e) {
            res.status(500).send({
                message: "Something terrible happened. Please contact support",
                statusCode: 500,
                data: []
            })
        }

    });
    router.post("/login", function (req, res) {
        let payload = {
            "username": req.body.username,
            "password": req.body.password,
            "organization": req.body.organization,

        };
        User.findOne(payload).then(function (user) {
            if (user && Object.keys(user).length > 0) {
                res.status(200).send(
                    {
                        message: "success",
                        token: jwt.sign(payload, "nu-one", { expiresIn: 60 * 60 }),
                        exprires: Math.floor(Date.now() / 1000) + (60 * 60),
                    }
                )
            } else {
                res.status(404).send({
                    message: "Invalid Request",
                    statusCode: 403,
                    data: []
                })
            }
        }).catch(function (err) {
            res.status(500).send({
                message: err.message,
                statusCode: 500,
                error: err
            })
        });
    })
});
userRoutes.group("/users/", (router) => {
    router.get('/', verifyToken, async function (req, res) {
        try {
            let filters = req.body.filters;
            let perPage = req.body.perPage || 10;
            let sortBy = req.body.sortBy || "emp_id";
            let sortOrder = req.body.sortOrder || 1;
            let page = req.body.page - 1 || 0;
            var sort = {}
            sort[sortBy] = parseInt(sortOrder); // Cannot use sort directly in mongoose, might be a bug
            const users = await User.find(filters).limit(perPage).skip(perPage * page).sort(sort).exec();
            const count = Object.keys(users).length;
            res.json({
                "message": count == 0 ? "No users found" : `${count} user/s found`,
                "page": page,
                "perpage": perPage,
                "sortBy": sortBy,
                "sortOrder": sortOrder,
                "resultCount": count,
                "data": users
            });
        } catch (e) {
            res.status(500).send({
                message: "Something terrible happened. Please contact support",
                statusCode: 500,
                data: []
            })
        }
    });
});



module.exports = userRoutes;