var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

/*
var WebDriver = require('selenium-webdriver');
var driver = new WebDriver.Builder().withCapabilities(
    WebDriver.Capabilities.chrome()
).build();
*/
//var proxy = require('selenium-webdriver/proxy');
//driver = new webdriver.Builder()
//.usingServer()
//.withCapabilities({'browserName': 'firefox' })
//.setProxy(proxy.manual({
//    http: 'http://proxy-pac-anycast.ericsson.se'
//}))
//.build();

driver.get('http://www.google.com/ncr');
driver.findElement(By.name('q')).sendKeys('webdriver');
driver.findElement(By.name('btnG')).click();
driver.wait(until.titleIs('webdriver - Google Search'), 1000);
driver.quit();