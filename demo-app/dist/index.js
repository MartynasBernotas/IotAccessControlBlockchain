"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
;
const app = express_1.default();
const port = 8888; // default port to listen
// define a route handler for the default home page
app.get("/device1", (req, res) => {
    res.send("17 Celsius");
});
app.get("/device2", (req, res) => {
    res.send("SMTH else");
});
// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map