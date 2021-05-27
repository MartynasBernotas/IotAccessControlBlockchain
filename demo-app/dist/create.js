"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const device_1 = require("./device");
const express_1 = __importDefault(require("express"));
const server = express_1.default();
server.get("/device1", (req, res) => {
    res.send("17 Celsius");
});
server.get("/device2", (req, res) => {
    res.send("SMTH else");
});
server.get('/', (req, res) => {
    res.send('Hello World!');
});
// start the Express server
server.listen(8888, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:8888`);
});
async function main() {
    var device1 = new device_1.Device('001', 'http://localhost:8888/device1', ['computer', 'fridge', 'wallet'], 'Sender');
    var device2 = new device_1.Device('002', 'http://localhost:8888/device2', ['computer', 'fridge', 'wallet'], 'Reciever');
    try {
        await device1.registerDevice();
        await device2.registerDevice();
        await device1.setAttributes();
        await device2.setAttributes();
        await device2.getDataFromDevice(device1.id);
        await device1.deleteDevice();
        await device2.deleteDevice();
    }
    catch (error) {
        console.error('Failed to submit transaction:', error);
        await device1.deleteDevice();
        await device2.deleteDevice();
        process.exit(1);
    }
}
void main();
//# sourceMappingURL=create.js.map