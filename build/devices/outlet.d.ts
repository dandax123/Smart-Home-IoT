import { IDevice, IPin, ISyncDevice } from '../utils/types';
export declare class Outlet implements IDevice {
    deviceId: string;
    roomName: string;
    pinAsset: Number;
    value: number;
    controlType: 'switch' | 'control';
    name: string;
    nickNames: string[];
    roomHint: string;
    constructor(objectId: string, pin: IPin, _pinAsset: number, _roomName: string, pinNumber: number);
    createDevice(): ISyncDevice;
}
