const express = require("express");
const attendanceRoute = express.Router();
const { ObjectId } = require("mongodb");
require("express-group-routes");
var objectId = require("mongodb").ObjectId;
var jwt = require('jsonwebtoken');
var moment = require('moment-timezone');


const User = require("../services/user.service");
const Attendance = require("../services/attendance.service");
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
attendanceRoute.group('/attendance/', (router) => {

    router.post("/:userId/checkin", async function (req, res) {

        try {
            const att = new Attendance();
            att.emp_id = req.params.userId;
            att.date = moment().tz("Asia/Colombo").format("YYYY-MM-DD");
            att.time = moment().tz("Asia/Colombo").format("HH:mm:ss");
            att.tstamp = moment().tz("Asia/Colombo").unix();
            att.type = "check-in"
            let error = att.validateSync();
            if (error) {
                res.status(400).send(
                    { message: error._message, statusCode: 400, errors: error.errors });
                return;
            }
            let data = await att.save();
            if (!data) {
                res.status(400).send({
                    message: `Unable to Checkin the user`,
                    statusCode: 400,
                    data: data,
                });
            } else {
                res.status(200).send({
                    message: `User Checked in successfully`,
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
    })
    router.post("/:userId/checkout", async function (req, res) {

        try {
            const att = new Attendance();
            att.emp_id = req.params.userId;
            att.date = moment().tz("Asia/Colombo").format('YYYY-MM-DD');
            att.time = moment().tz("Asia/Colombo").format("HH:mm:ss");
            att.tstamp = moment().tz("Asia/Colombo").unix();
            att.type = "check-out"
            let error = att.validateSync();
            if (error) {
                res.status(400).send(
                    { message: error._message, statusCode: 400, errors: error.errors });
                return;
            }
            let data = await att.save();
            if (!data) {
                res.status(400).send({
                    message: `Unable to checkout the user`,
                    statusCode: 400,
                    data: data,
                });
            } else {
                res.status(200).send({
                    message: `User checkedout in successfully`,
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
    })

    router.get('/:userId/status', async function (req, res) {
        try {
            Attendance.findOne({
                emp_id: req.params.userId,
            }).sort({ "tstamp": -1 }).exec(function (err, data) {
                if (err) {
                    res.status(400).send(
                        { message: err._message, statusCode: 400, errors: err.errors });
                    return;
                } else {
                    if (data === null) {
                        res.status(400).send(
                            { message: "No attendance record found", statusCode: 400 });
                        return;
                    }
                    res.status(200).send({
                        message: `current Status is ${data.type}`,
                        statusCode: 200,
                        data: data,
                    });
                }
            })
        } catch (e) {
            res.status(500).send({
                message: "Something terrible happened. Please contact support",
                statusCode: 500,
                data: []
            })
        }
    });
    router.get("/", async function (req, res) {
        try {
            let filters = req.body.filters;
            let perPage = req.query.perPage || 10;
            let sortBy = req.query.sortBy || "tstamp";
            let sortOrder = req.query.sortOrder || 1;
            let page = req.query.page || 0;
            var sort = {}
            sort[sortBy] = parseInt(sortOrder); // Cannot use sort directly in mongoose, might be a bug
            const attendance = await Attendance.find(filters).limit(perPage).skip(perPage * page).sort(sort).exec();
            const count = Object.keys(attendance).length;
            res.json({
                "message": count == 0 ? "No Attendance found" : `${count} attendance/s found`,
                "page": page + 1,
                "perpage": perPage,
                "sortBy": sortBy,
                "sortOrder": sortOrder,
                "resultCount": count,
                "data": attendance
            });
        } catch (e) {
            res.status(500).send({
                message: "Something terrible happened. Please contact support",
                statusCode: 500,
                data: []
            })
        }
    });
    router.post("/search", async function (req, res) {
        try {
            let filters = req.body.filters;
            let perPage = req.body.perPage || 10;
            let sortBy = req.body.sortBy || "tstamp";
            let sortOrder = req.body.sortOrder || 1;
            let page = req.body.page || 0;
            var sort = {}
            sort[sortBy] = parseInt(sortOrder); // Cannot use sort directly in mongoose, might be a bug
            const attendance = await Attendance.find(filters).limit(perPage).skip(perPage * page).sort(sort).exec();
            const count = Object.keys(attendance).length;
            res.json({
                "message": count == 0 ? "No Attendance found" : `${count} attendance/s found`,
                "page": page + 1,
                "perpage": perPage,
                "sortBy": sortBy,
                "sortOrder": sortOrder,
                "resultCount": count,
                "data": attendance
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

module.exports = attendanceRoute;
