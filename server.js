const http = require("http");
const fs = require("fs");
const querystring = require("querystring");
const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
  const {
    method,
    url,
    headers
  } = req;
  let reqMethod = req.method;
  let reqURL = req.url;

  if (reqMethod === "GET") {
    if (reqURL.length === 1) {
      console.log("reqURL", reqURL);
      console.log("reqURL.length", reqURL.length);
      reqURL = "/index.html";
    }
    fs.readFile(`./public/${reqURL}`, "utf8", (err, data) => {
      if (err) {
        fs.readFile("./public/404.html", "utf8", (err, data) => {
          if (err) {
            res.writeHead(500, "Internal Server Error");
            res.write("500 Internal Server Error");
            console.log("INTERNAL ERROR");
            return res.end();
          }
          res.writeHead(404, "Not Found");
          res.write(data);
          console.log("NOT FOUND");
          return res.end();
        });
      } else {
        res.writeHead(200, "OK");
        res.write(data);
        console.log("GET WORKED");
        return res.end();
      }
    });
  } else if (reqMethod === "POST") {
    req.on("data", chunk => {
      let chunkStr = chunk.toString();
      let chunkQuery = querystring.parse(chunkStr);
      console.log("chunkStr", chunkStr);
      console.log("chunkQuery", chunkQuery);

      POST(chunkQuery, res);
    });
  }
});

function POST(postReq, postRes) {
  fs.readFile(`./public/${postReq.elementName}.html`, "utf8", (err, data) => {
    if (err) {
      let newPost = `<!DOCTYPE html>\n 
            <html lang="en">\n
            <head>\n  
                <meta charset="UTF-8">\n  
                <title>The Elements - ${postReq.elementName}</title>\n 
                <link rel= "stylesheet" href="/css/styles.css">\n
            </head>\n
            <body>\n  
                <h1>${postReq.elementName}</h1>\n  
                <h2>${postReq.elementSymbol}</h2>\n  
                <h3>${postReq.elementAtomicNumber}</h3>\n  
                <p>${postReq.elementDescription}</p>\n  
                <p><a href="/">back</a></p>\n
            </body>\n
            </html>`;

      fs.writeFile(`./public/${postReq.elementName}.html`, newPost, err => {
        if (err) throw err;
      });

      fs.readdir("./public", "utf8", (err, files) => {
        let indexList = files
          .filter(element => {
            return (
              element.endsWith(".html") &&
              element !== "404.html" &&
              element !== "index.html"
            );
          })
          .map(element => {
            return `<li><a href='${element}'>${
              element.split(".")[0]
            }</a><li>\n`;
          })
          .join("");

        console.log("indexList", indexList);

        let newIndex = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>The Elements</title>
      <link rel="stylesheet" href="/css/styles.css">
    </head>
    <body>
      <h1>The Elements</h1>
      <h2>These are all the known elements.</h2>
      <h3>These are 2</h3>
      <ol>
     ${indexList}
      </ol>
    </body>
    </html>`;

        fs.writeFile("./public/index.html", newIndex, err => {
          if (err) throw err;
          console.log("index updated");
        });
      });

      postRes.setHeader("Content-Type", "application/json");
      postRes.writeHead(200, "OK");
      postRes.write(
        JSON.stringify({
          success: true
        })
      );
      return postRes.end();
    }

    postRes.setHeader("Content-Type", "application/json");
    postRes.writeHead(400, "Bad Request");
    postRes.write(
      JSON.stringify({
        error: "file already exists"
      })
    );
    return postRes.end();
  });
}

server.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});