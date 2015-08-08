var moment = require('moment');
var webdriver = require('selenium-webdriver');

// 5min * 60s * 1000ms = 300.000ms
var TIMEOUT = 300000;
var BASE_URL = 'www.skyscanner.ie/transport/flights';

// ----------------------------------

var _begin = moment("2015-12-11");
var _end = moment("2016-01-20"); // inclusive
var _from = 'dub';
var _to = 'mex';
var _trip_min = 21; // inclusive
var _trip_max = 31; // inclusive

// ----------------------------------
var By = webdriver.By;
var until = webdriver.until;
var driver = new webdriver.Builder().forBrowser('firefox').build();
var cal = new FightCalendar(_begin, _end);

// ----------------------------------
search();
// ----------------------------------

function search() {

    var currentDates = cal.nextDates();

    if (cal.isDone()) {
        // stop searching
        return;
    }

    driver.get('http://' + BASE_URL + '/' + _from + '/' + _to + '/' + currentDates.depart.format('YYMMDD') + '/' + currentDates.back.format('YYMMDD'));
    driver.wait(until.elementIsNotVisible(driver.findElement(By.id("progress-meter"))), TIMEOUT);
    driver.findElements(By.css("a.mainquote-price")).then(function (prices) {
        // first price only
        prices[0].getText().then(function (price) {
            console.log({depart: currentDates.depart.format('DD/MM/YYYY'), back: currentDates.back.format('DD/MM/YYYY'), price: price});
        });
    });

    driver.call(function () {
        // next search
        search();
    })
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
        return this._depart.isSame(_end) && this._return.isSame(_end);
    }

    function isInvalidDate(d, r) {
        // check if trip is between min and max AND that depart is before return
        var trip_size = Math.abs(d.diff(r, 'days'));
        return trip_size < _trip_min || trip_size > _trip_max || d.isAfter(r);
    }

}
