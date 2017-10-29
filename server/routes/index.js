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

//configure
const myLog = '/home/ec2-user/mcscript/source/log.txt';


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

/* FUNCTION BLOCK */
function scheduleTask(){
schedule.scheduleJob("0 * * * * ", function(){
        subOrUnsub("tphilips1101@gmail.com")
    });
    schedule.scheduleJob("10 * * * * ", function(){
        subOrUnsub("tphilips1101@gmail.com")
    });

    schedule.scheduleJob("0 */2 * * * ", function(){
        subOrUnsub("ahnsangjun49@gmail.com")
    });
    schedule.scheduleJob("10 */2 * * * ", function(){
        subOrUnsub("ahnsangjun49@gmail.com")
    });

    schedule.scheduleJob("0 */3 * * * ", function(){
        subOrUnsub("sangahn3@gmail.com")
    });
    schedule.scheduleJob("10 */3 * * * ", function(){
        subOrUnsub("sangahn3@gmail.com")
    });

    schedule.scheduleJob("0 */4 * * * ", function(){
        subOrUnsub("johnwaynegitlin@gmail.com")
    });
    schedule.scheduleJob("10 */4 * * * ", function(){
        subOrUnsub("johnwaynegitlin@gmail.com")
    });

 schedule.scheduleJob("0 */5 * * * ", function(){
        subOrUnsub("enriquegitlin8809@gmail.com")
    });
    schedule.scheduleJob("10 */5 * * * ", function(){
        subOrUnsub("enriquegitlin8809@gmail.com")
    });

    schedule.scheduleJob("0 */6 * * * ", function(){
        subOrUnsub("johnwayneandrea@gmail.com")
    });
    schedule.scheduleJob("10 */6 * * * ", function(){
        subOrUnsub("johnwayneandrea@gmail.com")
    });
}


function getUserStatus(email, callback){
    let fullUrl = util.format('https://us17.api.mailchimp.com/3.0/lists/9b97dd4dbd/members/%s', md5(email));

    request({
        url: fullUrl,
        method:"GET",
        headers: {
            'Authorization': "api_key ce38a2b163c66ab21aa3a0d809c3db4b-us17"
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

    let fullUrl = util.format('https://us17.api.mailchimp.com/3.0/lists/9b97dd4dbd/members/%s', md5(email));

    let prevStatus = null;
    getUserStatus(email, function(status){
        prevStatus = status;
        request({
            //set URL
            url: fullUrl,
            method: "PUT",
            json: true,
            //set headers
            headers: {
                'Authorization': "api_key ce38a2b163c66ab21aa3a0d809c3db4b-us17",
                'Content-Type': "application/json"
            },
            //post body
            body: {
                "status": status === "subscribed" ? "unsubscribed" : "subscribed"
            }

        }, (error, response) => {

        if (error){
                console.log("error: " + JSON.stringify(error));
            } else if (response.statusCode != 200){
                fs.appendFile(myLog, util.format("%s\n\n", response.body.detail));
            } else {
                let logFormat = "Current Time: %s Response Code: %d, Message: %s\n\n";
                let logTime = new Date();
                let resCode = response.statusCode;
                let resBody = util.format("For %s, status changed from %s to %s", response.body.email_address, status, response.body.status);
                fs.appendFile(myLog, util.format(logFormat, logTime, resCode, resBody));
            }
        })
    });

}


module.exports = router;

