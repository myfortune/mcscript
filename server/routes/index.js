"use strict";

//modules needed for this app..
const express = require('express');
const router = express.Router();
const util = require('util');
const fs = require('fs');
const request = require("request");
const download = require("download");
const schedule = require('node-schedule');
const https = require('https');
const md5  = require("md5");
const bodyParser = require("body-parser");

//configure
const myLog = '/home/ec2-user/mcscript/source/log.txt';
const myWebhook = '/home/ec2-user/mcscript/source/webhook.txt';
//constants
const listURL = 'https://us17.api.mailchimp.com/3.0/lists/9b97dd4dbd/members/%s';
const api_key = "api_key ce38a2b163c66ab21aa3a0d809c3db4b-us17";
const logFormat = "Current Time: %s Response Code: %d, Message: %s\n\n";
const email_list = []; // emails to be used for testing.


//schedule tasks.
scheduleTask();
//log page
router.get('/logs', (req, res) => {
    let contentData = null;
    fs.readFile(myLog, 'utf8', function(err, data){
        if (err){
            console.log(err);
        } else {
            res.render('index', {contents: data.split("\n\n")});
            contentData = data;
        }
    });
});

router.post('/webhook', (req, res) => {
    console.log(req);
    console.log(JSON.stringify(req.body));

    fs.appendFile(myWebhook, util.format("RES: %s\n", req));
    fs.appendFile(myWebhook, util.format("RESBODY: %s\n", JSON.stringify(req.body)));

    var data = {message: "good"};
    res.status(200).send(JSON.stringify(data));
   //res.render('webhook',  {response: JSON.stringify(req.body)});

});

/* FUNCTION BLOCK */
function scheduleTask(){
    email_list.map((email, index) => {
        schedule.scheduleJob(
            util.format("0 %s * * *", util.format("*/%d", index + 1)), function(){
                subOrUnsub(email);
            });
        schedule.scheduleJob(
            util.format("10 %s * * *", util.format("*/%d", index + 1)), function(){
                subOrUnsub(email);
            });
    });
}


function getUserStatus(email, callback){
    let fullUrl = util.format(listURL, md5(email));

    request({
        url: fullUrl,
        method:"GET",
        headers: {
            'Authorization': api_key
        }
    }, (err, res) => {
        if (err){
            console.log(err);
        } else {
            console.log(res);
        }
        callback(JSON.parse(res.body).status);
    })
}

function subOrUnsub(email){

    //add MD5 hash email address to url
    let fullUrl = util.format(listURL, md5(email));

    //status before sub/unsub
    let prevStatus = null;
    getUserStatus(email, function(status){
        prevStatus = status;
        request({
            url: fullUrl,
            method: "PUT",
            json: true,
            headers: {
                'Authorization': api_key,
                'Content-Type': "application/json"
            },
            body: {
                "status": status === "subscribed" ? "unsubscribed" : "subscribed"
            }
        }, (error, response) => {
            if (error){
                console.log("error: " + JSON.stringify(error));
            } else if (response.statusCode != 200){
                let comment = util.format("For %s, %s", email, response.body.detail);
                fs.appendFile(myLog, util.format(logFormat, new Date(), response.statusCode, comment));
            } else {
                let comment = util.format("For %s, status changed from %s to %s", response.body.email_address, status, response.body.status);
                fs.appendFile(myLog, util.format(logFormat, new Date(),  response.statusCode, comment));
            }
        })
    });

}

module.exports = router;

