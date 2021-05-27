import { Gateway, Wallets, Wallet } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';
import { Guid } from "guid-typescript";

export class Device {
    public id: string;
    public globalAddress: string;
    public attributes: string[];
    public role: string;
    private globalId: string;

    constructor (id: string, globalAddress: string, attributes: string[], role: string){
        this.id = id;
        this.globalAddress = globalAddress;
        this.attributes = attributes;
        this.role = role;
        this.globalId = "";
    }

    public async registerDevice(): Promise<void>{
        if(this.globalId === ""){
            const { contract, gateway } = await this.constructNetworkRequirements();
            const deviceGlobalId = Guid.create().toString();
            await contract.submitTransaction('registerDevice', this.id, deviceGlobalId, this.globalAddress, this.role);
            this.globalId = deviceGlobalId;
            console.log('Transaction has been submitted');
            gateway.disconnect();
        }else{
            console.log('Transaction has been submitted');
        }
    
    }

    public async setAttributes(): Promise<void>{
        const { contract, gateway } = await this.constructNetworkRequirements();
        await contract.submitTransaction('setAttributes', this.id, this.attributes.join(';'));
        console.log('Transaction has been submitted');
        gateway.disconnect();
    }

    public async deleteDevice(): Promise<void>{
        const { contract, gateway } = await this.constructNetworkRequirements();
        await contract.submitTransaction('deleteDevice', this.id);
        console.log('Transaction has been submitted');
        gateway.disconnect();
    }

    public async getDataFromDevice(deviceId: string): Promise<void>{
        const { contract, gateway } = await this.constructNetworkRequirements();
        var data = await contract.submitTransaction('getInfo', this.id, deviceId);
        console.log(data);
        console.log(data.toString());
        gateway.disconnect();
    }

    private async constructNetworkRequirements() {
        const wallet = await this.createWallet();
        const gateway = await this.createGateway(wallet);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('DeviceContract');
        return { contract, gateway };
    }

    private async createGateway(wallet: Wallet) {
        const gateway = new Gateway();
        const connectionProfilePath = path.resolve(__dirname, '..', 'connection.json');
        const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8')); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        const connectionOptions = { wallet, identity: 'Org1 Admin', discovery: { enabled: true, asLocalhost: true } };
        await gateway.connect(connectionProfile, connectionOptions);
        return gateway;
    }

    private async createWallet() {
        const walletPath = path.join(process.cwd(), 'Org1Wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        return wallet;
    }
}