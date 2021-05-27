/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Device } from './device';
import * as request from "request-promise-native";
import { ClientIdentity } from 'fabric-shim';

@Info({title: 'DeviceContract', description: 'My Smart Contract' })
export class DeviceContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async deviceExists(ctx: Context, deviceId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(deviceId);
        return (!!data && data.length > 0);
    }

    @Transaction()
    @Returns('string')
    public async registerDevice(ctx: Context, deviceId: string, idInNetwork: string, globalAddress: string, accessRole: string): Promise<string> {
        const identity: ClientIdentity = ctx.clientIdentity;
        const checkAttr: boolean = identity.assertAttributeValue('restricted', 'true');
        if (checkAttr) { 
            throw new Error('You must be a administrator to carry out this transaction!');
        }

        const exists: boolean = await this.deviceExists(ctx, deviceId);
        if (exists) {
            throw new Error(`Device with id ${deviceId} already exists!`);
        }

        const device: Device = new Device();
        device.idInNetwork = idInNetwork;
        //replacing localhost to make API calls from inside Docker container
    
        device.globalAddress = globalAddress.replace('localhost', 'host.docker.internal');;

        //access role should be "Sender", "Reciever" or "Sender/Reciever"
        device.accessRole = accessRole;
        const buffer: Buffer = Buffer.from(JSON.stringify(device));
        await ctx.stub.putState(deviceId, buffer);

        return device.idInNetwork;
    }

    @Transaction(false)
    @Returns('Device')
    public async readDevice(ctx: Context, deviceId: string): Promise<Device> {
        const exists: boolean = await this.deviceExists(ctx, deviceId);
        if (!exists) {
            throw new Error(`The device ${deviceId} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(deviceId);
        const device: Device = JSON.parse(data.toString()) as Device;
        return device;
    }

    @Transaction()
    public async setAttributes(ctx: Context, deviceId: string, attributes: string){
        const identity: ClientIdentity = ctx.clientIdentity;
        const checkAttr: boolean = identity.assertAttributeValue('restricted', 'true');
        if (checkAttr) { 
            throw new Error('You must be a administrator to carry out this transaction!');
        }

        const exists: boolean = await this.deviceExists(ctx, deviceId);
        if (!exists) {
            throw new Error(`The device ${deviceId} does not exist`);
        }

        const device: Device= await this.readDevice(ctx, deviceId);
        device.attributeList = attributes;
        const buffer: Buffer = Buffer.from(JSON.stringify(device));
        await ctx.stub.putState(deviceId, buffer);
    }

    @Transaction()
    public async deleteDevice(ctx: Context, deviceId: string): Promise<void> {
        const identity: ClientIdentity = ctx.clientIdentity;
        const checkAttr: boolean = identity.assertAttributeValue('restricted', 'true');
        if (checkAttr) { 
            throw new Error('You must be a administrator to carry out this transaction!');
        }

        const exists: boolean = await this.deviceExists(ctx, deviceId);
        if (!exists) {
            throw new Error(`The device ${deviceId} does not exist`);
        }
        await ctx.stub.deleteState(deviceId);
    }

    @Transaction(false)
    public async queryAllDevices(ctx: Context): Promise<string> {
        const startKey = '000';
        const endKey = '999';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString());

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString();
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    @Transaction(false)
    public async checkAccess(ctx: Context, recieverId: string, senderId: string): Promise<boolean> {
        var exists: boolean = await this.deviceExists(ctx, recieverId);
        if (!exists) {
            throw new Error(`The device ${recieverId} does not exist`);
        }
        exists = await this.deviceExists(ctx, senderId);
        if (!exists) {
            throw new Error(`The device ${senderId} does not exist`);
        }

        const reciever: Device = await this.readDevice(ctx, recieverId);
        const sender: Device = await this.readDevice(ctx, senderId);

        return this.validateDevicesAccess(reciever, sender);
    }

    //simulating access control rules check
    @Transaction(false)
    private validateDevicesAccess(reciever: Device, sender: Device): boolean {
        const recieverAttributes = reciever.attributeList.split(';');
        const giverAttributes = sender.attributeList.split(';');

        if(reciever.accessRole === "Reciever" && sender.accessRole === "Sender"){
            return recieverAttributes.some(atr=> giverAttributes.includes(atr));
        }

        return false;
    }

    @Transaction(false)
    public async getInfo(ctx: Context, recieverId: string, senderId: string): Promise<string> {
        const reciever: Device = await this.readDevice(ctx, recieverId);
        const sender: Device = await this.readDevice(ctx, senderId);

        var accessGranted = await this.validateDevicesAccess(reciever, sender)
        if(!accessGranted){
            throw new Error(`Access denied`);
        }
        const result = await request.get(sender.globalAddress);

        return result.toString();
    }
}
