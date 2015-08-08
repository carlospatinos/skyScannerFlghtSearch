require('selenium-webdriver');

var price = '€982';
console.log(price.replace('€', ''));

var webdriver = require('selenium-webdriver');

//var driver = new webdriver.Builder().forBrowser('firefox').build();

var driver = new webdriver.Builder().
   withCapabilities(webdriver.Capabilities.chrome()).
   build();

driver.get('http://www.google.com');
driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
driver.findElement(webdriver.By.name('btnG')).click();
driver.wait(function() {
 return driver.getTitle().then(function(title) {
   return title === 'webdriver - Google Search';
 });
}, 1000);

driver.quit();