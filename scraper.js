// Inlcude the modules
const fs = require('fs'),
scrapeIt = require('scrape-it'),
json2csv = require('json2csv'),
date = new Date();

// Function to format time to two digits.
function editTime(time){
  if((time.toString()).length === 1){
    return '0' + time;
  } else {
    return time.toString();
  }
}

let year = date.getFullYear().toString(),
    month = editTime(date.getMonth() + 1),
    day = editTime(date.getDate()),
    today = `${year}-${month}-${day}`,
    time = `${today} ${date.getHours()}:${date.getMinutes()}`,
    myData = [],
    fields = ['title', 'price', 'imageUrl', 'url', 'time'],
    fieldNames = ['TITLE', 'PRICE', 'IMAGE-URL', 'URL', 'TIME'],
    timeStamp = date.toGMTString();



// Create a folder "data" if it does not exist already
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data');
  console.log('Folder "data" created.');
}

// Use scrape-it npm module to scrap the needed info
scrapeIt("http://shirts4mike.com/shirts.php", {
  shirts : {
    listItem : ".products li"
    ,data : {
      url : { 
        selector : "a",
        attr : "href"
      }      
    } 
  }
}).then(shirts => {
  shirts = shirts.shirts;
  shirts = shirts.map( shirt => {
    return  {
      url : `http://shirts4mike.com/${shirt.url}`
    }
  });
  shirts.forEach(shirt => {
    scrapeIt(shirt.url, {
      title : "title",
      price : ".price",
      imageUrl: {
        selector: '.shirt-picture img',
        attr: 'src'
      }
    }).then( data => {
      shirt.title = data.title;
      shirt.price = data.price;
      shirt.imageUrl = data.imageUrl;
      shirt.time = time;
      myData.push(shirt);
    }).then(() => { // put the result in a CSV file using json2cvs npm module
        let result = json2csv({ data: myData, fields: fields, fieldNames: fieldNames });
        let fileName = `./data/${today}.csv`;
        fs.writeFile(fileName, result, (err) => {
        if (err) throw err;
        });
      });
  });
}).catch(error => { // if there was an error connectiong to the site, save it in the scraper.error.log file
  let message = `[${timeStamp}] Cannot connect to http://shirts4mike.com.\n`;
  let fileName = `./data/scraper-error.log`;
  fs.appendFile(fileName, message, (err) => {
    if (err) throw err;
    console.error(message);
  });
});



