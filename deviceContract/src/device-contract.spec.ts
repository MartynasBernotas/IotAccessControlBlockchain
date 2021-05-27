/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { DeviceContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logger = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('DeviceContract', () => {

    let contract: DeviceContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new DeviceContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"device 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"device 1002 value"}'));
    });

    describe('#deviceExists', () => {

        it('should return true for a device', async () => {
            await contract.deviceExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a device that does not exist', async () => {
            await contract.deviceExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createDevice', () => {

        it('should create a device', async () => {
            await contract.createDevice(ctx, '1003', 'device 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"device 1003 value"}'));
        });

        it('should throw an error for a device that already exists', async () => {
            await contract.createDevice(ctx, '1001', 'myvalue').should.be.rejectedWith(/The device 1001 already exists/);
        });

    });

    describe('#readDevice', () => {

        it('should return a device', async () => {
            await contract.readDevice(ctx, '1001').should.eventually.deep.equal({ value: 'device 1001 value' });
        });

        it('should throw an error for a device that does not exist', async () => {
            await contract.readDevice(ctx, '1003').should.be.rejectedWith(/The device 1003 does not exist/);
        });

    });

    describe('#updateDevice', () => {

        it('should update a device', async () => {
            await contract.updateDevice(ctx, '1001', 'device 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"device 1001 new value"}'));
        });

        it('should throw an error for a device that does not exist', async () => {
            await contract.updateDevice(ctx, '1003', 'device 1003 new value').should.be.rejectedWith(/The device 1003 does not exist/);
        });

    });

    describe('#deleteDevice', () => {

        it('should delete a device', async () => {
            await contract.deleteDevice(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a device that does not exist', async () => {
            await contract.deleteDevice(ctx, '1003').should.be.rejectedWith(/The device 1003 does not exist/);
        });

    });

});
