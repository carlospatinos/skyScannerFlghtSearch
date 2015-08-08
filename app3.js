var moment = require('moment');
var webdriver = require('selenium-webdriver');

// 5min * 60s * 1000ms = 300.000ms
var TIMEOUT = 300000;
var BASE_URL = 'www.skyscanner.ie/transport/flights';

// ----------------------------------

var _begin = moment("2015-12-15");
var _end = moment("2015-12-19"); // inclusive
var _from = 'dub';
var _to = 'mex';
var _trip_min = 2; // inclusive
var _trip_max = 3; // inclusive
var _adults = 2;
var _children = 1;
var _infants = 1;
var bestPrice = 0;

// ----------------------------------
//var By = webdriver.By;
//var until = webdriver.until;
//var driver = new webdriver.Builder().forBrowser('firefox').build();
var cal = new FightCalendar(_begin, _end);

var currentDates = cal.nextDates();
// ----------------------------------
while (!cal.isDone()) {
    currentDates = cal.nextDates()
    console.log({depart: currentDates.depart.format('DD/MM/YYYY'), back: currentDates.back.format('DD/MM/YYYY')});
}
return;
//driver.quit();




// ----------------------------------

function search() {
    var currentDates = cal.nextDates();

    if (cal.isDone()) {
        // stop searching
        return;
    }

    driver.get('http://' + BASE_URL + '/' + _from + '/' + _to + '/' + currentDates.depart.format('YYMMDD') + '/' + currentDates.back.format('YYMMDD') + '?adults=' + _adults + '&children=' + _children + '&infants=' + _infants);
    driver.wait(until.elementIsNotVisible(driver.findElement(By.id("progress-meter"))), TIMEOUT);
    driver.findElements(By.css("a.mainquote-price")).then(function (prices) {
        // first price only
        prices[0].getText().then(function (price) {
            console.log({depart: currentDates.depart.format('DD/MM/YYYY'), back: currentDates.back.format('DD/MM/YYYY'), price: price});
        });
    });

    
}


function FightCalendar(begin, end) {

    this._begin = begin;
    this._end = end;
    this._depart = begin.clone();
    this._return = begin.clone();

    this.nextDates = function () {
        do {
            this._return.add(1, 'days');
            if (this._return.isAfter(_end)) {
                this._return = begin.clone();
                this._depart.add(1, 'days');
            }
            var invalid = isInvalidDate(this._depart, this._return);
        } while (invalid && !this.isDone());
        return {depart: this._depart, back: this._return};
    }

    this.isDone = function () {
        isDoneValue = this._depart.isSame(_end) && this._return.isSame(_end);
        //console.log("isDone: " + isDoneValue + " _depart: "+ this._depart.format('DD/MM/YYYY') + " _end: " + this._end.format('DD/MM/YYYY') + " _return: " + this._return.format('DD/MM/YYYY'));
        return isDoneValue;
    }

    function isInvalidDate(d, r) {
        // check if trip is between min and max AND that depart is before return
        var trip_size = Math.abs(d.diff(r, 'days'));
        return trip_size < _trip_min || trip_size > _trip_max || d.isAfter(r);
    }

}
