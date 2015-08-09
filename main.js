var moment = require('moment');
var log4js = require('log4js');
var webdriver = require('selenium-webdriver');
var proxy = require('selenium-webdriver/proxy');
var monk = require('monk');
var async = require("async");
var db = monk('localhost:27017/collectionFromMongo');



var logger = log4js.getLogger();
logger.setLevel('TRACE');

var origin = 'dub' //dub, shan, ork
var destiny = 'mex' // cun for cancun, mex for mexico
var minDepartureDate = moment('2015-12-11'); // inclusive
var maxReturnDate = moment('2016-01-12'); //moment('2016-01-12'); //inclusive
var minDuration = 21;
var maxDuration = 31;
var adults = 2;
var children = 1;
var infants = 1;


// 5min * 60s * 1000ms = 300.000ms
// 3min = 180000
var TIMEOUT = 180000;
var BASE_URL = 'www.skyscanner.ie/transport/flights';

// ----------------------------------
var By = webdriver.By;
var until = webdriver.until;

//var profile = new FirefoxProfile();
//profile.setPreference("network.proxy.http", "localhost");
//profile.setPreference("network.proxy.http_port", "3128");
//profile.setPreference("network.proxy.type", 0);
//var driver = new FirefoxDriver(profile);

//var driver = new webdriver.Builder().forBrowser('firefox').build();
var driver = new webdriver.Builder().forBrowser('firefox').setProxy(proxy.direct()).build();


var flightCal = new FlightCalendar(minDepartureDate, maxReturnDate, minDuration, maxDuration);
flightCal.generateDates();

main(origin, destiny, adults, children, infants);

function main(from, to, adults, children, infants) {
    listOfSchedules = flightCal.getGeneratedDates();

    async.each(listOfSchedules,
      // 2nd param is the function that each item is passed to
      function(schedule, callback){
        // Call an asynchronous function, often a save() to DB
        search(from, to, adults, children, infants, schedule, callback);
      },
      // 3rd param is the function to call when everything's done
      function(err){
        // All tasks are done now
        console.log("All done");
        driver.quit();
        process.exit()
      }
    );
}

function search(from, to, adults, children, infants, schedule, callback) {
    passengerOptions = '?adults=' + adults;
    if (children > 0) {
        passengerOptions = passengerOptions + '&children=' + children;
    }
    if (infants > 0) {
        passengerOptions = passengerOptions + '&infants=' + infants;
    }

    var urlToCheck = 'http://' + BASE_URL + '/' + from + '/' + to + '/' + schedule.departureDate.format('YYMMDD') + '/' + schedule.returnDate.format('YYMMDD') + passengerOptions;
    logger.debug(schedule.id + " >> " + urlToCheck);
    
    driver.get(urlToCheck);
    driver.findElement(webdriver.By.id('progress-meter')).then(function(webElement) {
        logger.debug('Element exists');
        driver.wait(until.elementIsNotVisible(driver.findElement(By.id("progress-meter"))), TIMEOUT);
    }, function(err) {
        if (err.state && err.state === 'no such element') {
            logger.warn('Element not found');
        } else {
            webdriver.promise.rejected(err);
        }
    });

    driver.findElements(By.css("a.mainquote-price")).then(function (prices) {
    // first price only
        if (prices[0] != undefined) {
            prices[0].getText().then(function (price) {
                var now = moment();
                var result = {numberOfDays: schedule.numberOfDays, departureDate: schedule.departureDate.format('DD/MM/YYYY'), returnDate: schedule.returnDate.format('DD/MM/YYYY'), price: price, url: urlToCheck, executionDate: now.format('DD/MM/YYYY HH:mm'), origin: from, destiny: to};
                logger.info(schedule.id + " >> " + JSON.stringify(result));
                var collection = db.get('skyScanner');
                collection.insert(result);
             });
        } else {
            logger.warn("No price found for: " + urlToCheck);
        }
        callback();
    });

    
    
}

function FlightCalendar(minDepartureDate, maxReturnDate, minDuration, maxDuration) {
    this.minDepartureDate = minDepartureDate;
    this.maxReturnDate = maxReturnDate;
    this.minDuration = minDuration;
    this.maxDuration = maxDuration;

    this.generatedDates = [];


    this.generateDates = function () {
        if (this.minDepartureDate.isAfter(this.maxReturnDate)) {
            logger.error("Error: minDepartureDate is after maxReturnDate");
        }
        var siteId = 0;
        for (var startDateToTest = this.minDepartureDate.clone(); startDateToTest.isBefore(this.maxReturnDate); startDateToTest.add(1, 'days')) {
            for (var numberOfDaysToStay = this.minDuration; numberOfDaysToStay <= this.maxDuration; numberOfDaysToStay++) {
                var endDateToTest = moment(startDateToTest);
                endDateToTest.add(numberOfDaysToStay, 'days');
                if (endDateToTest.isAfter(this.maxReturnDate)) {
                    continue;
                }
                siteId++;
                //logger.debug("numberOfDaysToStay: " + numberOfDaysToStay + " >> From: " + startDateToTest.format('YYYY-MM-DD') + " To: " + endDateToTest.format('YYYY-MM-DD') );
                var queryData = {id: siteId, departureDate: startDateToTest.format('YYYY-MM-DD'), returnDate: endDateToTest.format('YYYY-MM-DD'), numberOfDays: numberOfDaysToStay}
                logger.debug(JSON.stringify(queryData));
                this.generatedDates.push({id: siteId, departureDate: startDateToTest.clone(), returnDate: endDateToTest.clone(), numberOfDays: numberOfDaysToStay});
            }
        }
        
    }

    this.getGeneratedDates = function()  {
        return this.generatedDates;
    }
}