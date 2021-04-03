import { IDevice, IPin, ISyncDevice } from '../utils/types';
export declare class FakeDevice implements IDevice {
    deviceId: string;
    roomName: string;
    pinAsset: Number;
    value: number;
    controlType: 'switch' | 'control';
    name: string;
    roomHint: string[];
    nickNames: string[];
    constructor(objectId: string, pin: IPin, _pinAsset: number, _roomName: string, pinNumber: number);
    getRoomHint(): Promise<void>;
    getNicknames(): Promise<void>;
    createDevice(): ISyncDevice;
}
