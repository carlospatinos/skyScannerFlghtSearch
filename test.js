require('selenium-webdriver');


var webdriver = require('selenium-webdriver');

//var driver = new webdriver.Builder().forBrowser('firefox').build();

var By = webdriver.By;
var until = webdriver.until;
var driver = new webdriver.Builder().forBrowser('firefox').build();

/*driver.get('http://www.google.com');

driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
driver.findElement(webdriver.By.name('btnG')).click();

driver.wait(function() {
 return driver.getTitle().then(function(title) {
	console.log('[' + title + ']');
	if (title === 'Google') {
		return;
	}
	return title === 'webdriver - Google Search';
 });
}, 1000);

driver.findElement(webdriver.By.id('viewport')).then(function(webElement) {
        console.log('Element exists');
    }, function(err) {
        if (err.state && err.state === 'no such element') {
            console.log('Element not found');
        } else {
            webdriver.promise.rejected(err);
        }
    });
*/

driver.get('http://www.skyscanner.ie/transport/flights/dub/mex/151211/151213?adults=2&children=1&infants=1');

driver.findElement(webdriver.By.id('progress-meter')).then(function(webElement) {
        console.log('Element exists');
        driver.wait(until.elementIsNotVisible(driver.findElement(By.id("progress-meter"))), 100000);
    }, function(err) {
        if (err.state && err.state === 'no such element') {
            console.log('Element not found');
        } else {
            webdriver.promise.rejected(err);
        }
    });

driver.quit();

//{"price":1}
//{"_id":0}