/*const http = require("http");
const fs = require("fs");

const server= http.createServer((req, res) => {
    fs.readFile("sample.txt",(err, data) => {
        res.end(data);
    })
});
server.listen(3000);



const http = require("http");
const fs = require("fs");

fs.readFile("home.html", (err, home) => {
    console.log(home.toString());
  });

  fs.readFile("home.html", (err, home) => {
    if (err) {
      throw err;
    }
    http
      .createServer((request, response) => {
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write(home);
        response.end();
      })
      .listen(3000);
  });*/



const http = require("http");
const fs = require("fs");

var argv=require("minimist")(process.argv.slice(2));
console.log(argv);

let homeContent = "";
let projectContent = "";
let regContent = "";

fs.readFile("home.html", (err, home) => {
  if (err) {
    throw err;
  }
  homeContent = home;
});

fs.readFile("project.html", (err, project) => {
  if (err) {
    throw err;
  }
  projectContent = project;
});

fs.readFile("registration.html", (err, registration) => {
    if (err) {
      throw err;
    }
    regContent = registration;
  });

http
  .createServer((request, response) => {
    let url = request.url;
    response.writeHeader(200, { "Content-Type": "text/html" });
    switch (url) {
      case "/project":
        response.write(projectContent);
        response.end();
        break;
      case "/registration":
        response.write(regContent);
        response.end();
        break;
      default:
        response.write(homeContent);
        response.end();
        break;
    }
  })
  .listen(argv['port']);