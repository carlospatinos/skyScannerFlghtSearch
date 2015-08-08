var moment = require('moment');
var log4js = require('log4js');
var webdriver = require('selenium-webdriver');

var logger = log4js.getLogger();
logger.setLevel('TRACE');

var minDepartureDate = moment('2015-12-11'); // inclusive
var maxReturnDate = moment('2016-01-10'); //inclusive
var minDuration = 21;
var maxDuration = 31;
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

main('dub', 'mex', adults, children, infants);

function main(from, to, adults, children, infants) {
    listOfSchedules = flightCal.getGeneratedDates();

    listOfSchedules.forEach(function(schedule){
        search(from, to, adults, children, infants, schedule);
    });
}

function search(from, to, adults, children, infants, schedule) {
    var urlToCheck = 'http://' + BASE_URL + '/' + from + '/' + to + '/' + schedule.departureDate.format('YYMMDD') + '/' + schedule.returnDate.format('YYMMDD') + '?adults=' + adults + '&children=' + children + '&infants=' + infants;
    logger.debug(urlToCheck);
    
    driver.get(urlToCheck);
    driver.wait(until.elementIsNotVisible(driver.findElement(By.id("progress-meter"))), TIMEOUT);
    driver.findElements(By.css("a.mainquote-price")).then(function (prices) {
    // first price only
        prices[0].getText().then(function (price) {
            logger.info({departureDate: schedule.departureDate.format('DD/MM/YYYY'), returnDate: schedule.returnDate.format('DD/MM/YYYY'), price: price});
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
        var superId = 0;
        for (var startDateToTest = this.minDepartureDate.clone(); startDateToTest.isBefore(this.maxReturnDate); startDateToTest.add(1, 'days')) {
            for (var numberOfDaysToStay = this.minDuration; numberOfDaysToStay <= this.maxDuration; numberOfDaysToStay++) {
                var endDateToTest = moment(startDateToTest);
                endDateToTest.add(numberOfDaysToStay, 'days');
                if (endDateToTest.isAfter(this.maxReturnDate)) {
                    continue;
                }
                superId++;
                //logger.debug("numberOfDaysToStay: " + numberOfDaysToStay + " >> From: " + startDateToTest.format('YYYY-MM-DD') + " To: " + endDateToTest.format('YYYY-MM-DD') );
                logger.debug({departureDate: startDateToTest.format('YYYY-MM-DD'), returnDate: endDateToTest.format('YYYY-MM-DD'), numberOfDays: numberOfDaysToStay});
                this.generatedDates.push({departureDate: startDateToTest.clone(), returnDate: endDateToTest.clone(), numberOfDays: numberOfDaysToStay, superIdWow: superId});
            }
        }
        
    }

    this.getGeneratedDates = function()  {
        return this.generatedDates;
    }

}