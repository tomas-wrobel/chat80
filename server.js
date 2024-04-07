import {readFile, writeFile} from "node:fs";
import {WebSocketServer} from "ws";
import * as Http from "node:http";

const http = Http.createServer((request, response) => {
    switch (request.url) {
        case "/":
            readFile("src/client.html", "utf8", (error, data) => {
                if (error) {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write(error.message);
                    response.end();
                } else {
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write(data);
                    response.end();
                }
            });
            break;
        case "/script/":
            readFile("src/client.js", "utf8", (error, data) => {
                if (error) {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write(error.message);
                    response.end();
                } else {
                    response.writeHead(200, {"Content-Type": "text/javascript"});
                    response.write(`const ip = "${request.socket.remoteAddress}";\n\n${data}`);
                    response.end();
                }
            });
            break;
        case "/style/":
            readFile("src/client.css", "utf8", (error, data) => {
                if (error) {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write(error.message);
                    response.end();
                } else {
                    response.writeHead(200, {"Content-Type": "text/css"});
                    response.write(data);
                    response.end();
                }
            });
            break;
        case "/chat/":
            readFile("src/messages.json", "utf8", (error, data) => {
                if (error) {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write(error.message);
                    response.end();
                } else {
                    response.writeHead(200, {"Content-Type": "application/json"});
                    response.write(data);
                    response.end();
                }
            });
            break;
    }
});

http.listen(80);

const ws = new WebSocketServer({server: http})

ws.on("connection", socket => {
    socket.on("message", m => {
        const json = m.toString("utf8");

        readFile("src/messages.json", "utf8", (_, data) => {
            const messages = JSON.parse(data);
            messages.push(JSON.parse(json));
            writeFile("src/messages.json", JSON.stringify(messages), error => {
                if (error) {
                    console.error(error);
                } else {
                    ws.clients.forEach(e => e.send(json));
                }
            });
        });
    });
});