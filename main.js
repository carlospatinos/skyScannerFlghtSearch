var moment = require('moment');
var log4js = require('log4js');
var webdriver = require('selenium-webdriver');

var logger = log4js.getLogger();
logger.setLevel('ERROR');

var minDepartureDate = moment('2015-12-11'); // inclusive
var maxReturnDate = moment('2016-01-20'); //inclusive
var minDuration = 2;
var maxDuration = 3;
var adults = 2;
var children = 1;
var infants = 1;

// 5min * 60s * 1000ms = 300.000ms
var TIMEOUT = 600000;
var BASE_URL = 'www.skyscanner.ie/transport/flights';

// ----------------------------------
var By = webdriver.By;
var until = webdriver.until;
var driver = new webdriver.Builder().forBrowser('firefox').build();


var flightCal = new FlightCalendar(minDepartureDate, maxReturnDate, minDuration, maxDuration);
flightCal.generateDates();

main('dub', 'mex', 2, 1, 1);

function main(from, to, adults, children, infants) {
    listOfSchedules = flightCal.getGeneratedDates();
    for (var i = 0; i < listOfSchedules.length; i++) {
        schedule = listOfSchedules[i];
        var urlToCheck = 'http://' + BASE_URL + '/' + from + '/' + to + '/' + schedule.departureDate.format('YYMMDD') + '/' + schedule.returnDate.format('YYMMDD') + '?adults=' + adults + '&children=' + children + '&infants=' + infants;
        
        driver.call(function () {
            search(urlToCheck);
        });
        
    }
}

function search(urlToCheck) {
    console.log(urlToCheck);
    driver.get(urlToCheck);
    driver.wait(until.elementIsNotVisible(driver.findElement(By.id("progress-meter"))), TIMEOUT);
    driver.findElements(By.css("a.mainquote-price")).then(function (prices) {
    // first price only
        prices[0].getText().then(function (price) {
            console.log({departureDate: currentDates.depart.format('DD/MM/YYYY'), returnDate: currentDates.back.format('DD/MM/YYYY'), price: price});
        });
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
        for (var startDateToTest = this.minDepartureDate.clone(); startDateToTest.isBefore(this.maxReturnDate); startDateToTest.add(1, 'days')) {
            for (var numberOfDaysToStay = this.minDuration; numberOfDaysToStay <= this.maxDuration; numberOfDaysToStay++) {
                var endDateToTest = moment(startDateToTest);
                endDateToTest.add(numberOfDaysToStay, 'days');
                if (endDateToTest.isAfter(this.maxReturnDate)) {
                    continue;
                }
                logger.debug("numberOfDaysToStay: " + numberOfDaysToStay + " >> From: " + startDateToTest.format('YYYY-MM-DD') + " To: " + endDateToTest.format('YYYY-MM-DD') );
                //logger.debug({departureDate: startDateToTest.format('YYYY-MM-DD'), returnDate: endDateToTest.format('YYYY-MM-DD'), numberOfDays: numberOfDaysToStay});
                this.generatedDates.push({departureDate: startDateToTest, returnDate: endDateToTest, numberOfDays: numberOfDaysToStay});
            }
        }
        
    }

    this.getGeneratedDates = function()  {
        return this.generatedDates;
    }

}