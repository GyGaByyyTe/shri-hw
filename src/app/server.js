const fs = require("fs");
const JSONStream = require("JSONStream");
const express = require("express");
var os = require("os");

const networkInterfaces = os.networkInterfaces();
const app = express();
const port = 8000;

const filePath = __dirname + "/events.json";
const statuses = ["info", "critical"];
const startTime = new Date();

app.use(express.static(__dirname + "../../../build/"));

app.get("/status", (req, res) => {
  let estimateTime = new Date() - startTime;
  function secondsToHMS(secs) {
    function z(n) {
      return (n < 10 ? "0" : "") + n;
    }
    secs = Math.abs(secs);
    return (
      z((secs / 3600) | 0) +
      ":" +
      z(((secs % 3600) / 60) | 0) +
      ":" +
      z(Math.floor(secs % 60))
    );
  }
  res.send(`<h1>server uptime: ${secondsToHMS(estimateTime / 1000)}</h1>`);
});

app.get("/api/events", (req, res) => {
  //есть гет параметры и среди них type
  if (Object.keys(req.query).length > 0 && req.query.type) {
    const params = req.query.type.split(":");
    for (let index = 0; index < params.length; index++) {
      if (!statuses.includes(params[index])) {
        res.status(400).send("<h1>ERROR 400 incorrect type</h1>");
        return;
      }
    }
    res.set({ "content-type": "application/json; charset=utf-8" });
    const stream = fs.createReadStream(filePath, { encoding: "utf8" });
    const parser = JSONStream.parse("events.*");

    stream.pipe(parser);

    parser.on("data", function(obj) {
      if (params.includes(obj["type"])) {
        res.write(JSON.stringify(obj, null, 2));
      }
    });

    stream.on("end", function(obj) {
      res.end();
    });
  } else {
    // выборка не требуется, транслируем весь файл
    res.set({ "content-type": "application/json; charset=utf-8" });
    fs.createReadStream(filePath, { flags: "r" }).pipe(res);
  }
});

app.use((req, res, next) => {
  res.status(404).send("<h1>Page not found</h1>");
});
app.listen(port, () => {
  let currentTime = startTime.toTimeString().split(" ")[0];
  console.log(
    `Server started at ${currentTime},
		 local: http://localhost:${port}`
  );
});
