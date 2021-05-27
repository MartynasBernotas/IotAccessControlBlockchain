"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
const fabric_network_1 = require("fabric-network");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const guid_typescript_1 = require("guid-typescript");
class Device {
    constructor(id, globalAddress, attributes, role) {
        this.id = id;
        this.globalAddress = globalAddress;
        this.attributes = attributes;
        this.role = role;
        this.globalId = "";
    }
    async registerDevice() {
        if (this.globalId === "") {
            const { contract, gateway } = await this.constructNetworkRequirements();
            const deviceGlobalId = guid_typescript_1.Guid.create().toString();
            await contract.submitTransaction('registerDevice', this.id, deviceGlobalId, this.globalAddress, this.role);
            this.globalId = deviceGlobalId;
            console.log('Transaction has been submitted');
            gateway.disconnect();
        }
        else {
            console.log('Transaction has been submitted');
        }
    }
    async setAttributes() {
        const { contract, gateway } = await this.constructNetworkRequirements();
        await contract.submitTransaction('setAttributes', this.id, this.attributes.join(';'));
        console.log('Transaction has been submitted');
        gateway.disconnect();
    }
    async deleteDevice() {
        const { contract, gateway } = await this.constructNetworkRequirements();
        await contract.submitTransaction('deleteDevice', this.id);
        console.log('Transaction has been submitted');
        gateway.disconnect();
    }
    async getDataFromDevice(deviceId) {
        const { contract, gateway } = await this.constructNetworkRequirements();
        var data = await contract.submitTransaction('getInfo', this.id, deviceId);
        console.log(data);
        console.log(data.toString());
        gateway.disconnect();
    }
    async constructNetworkRequirements() {
        const wallet = await this.createWallet();
        const gateway = await this.createGateway(wallet);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('DeviceContract');
        return { contract, gateway };
    }
    async createGateway(wallet) {
        const gateway = new fabric_network_1.Gateway();
        const connectionProfilePath = path.resolve(__dirname, '..', 'connection.json');
        const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8')); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        const connectionOptions = { wallet, identity: 'Org1 Admin', discovery: { enabled: true, asLocalhost: true } };
        await gateway.connect(connectionProfile, connectionOptions);
        return gateway;
    }
    async createWallet() {
        const walletPath = path.join(process.cwd(), 'Org1Wallet');
        const wallet = await fabric_network_1.Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        return wallet;
    }
}
exports.Device = Device;
//# sourceMappingURL=device.js.map