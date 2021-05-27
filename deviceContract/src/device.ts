/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Device {
    @Property()
    public idInNetwork: string;

    @Property()
    public attributeList: string;

    @Property()
    public accessRole: string;
    
    @Property()
    public globalAddress: string;
}
