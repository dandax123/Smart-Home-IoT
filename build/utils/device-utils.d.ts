import { IPin, ISyncDevice } from './types';
export declare function getDeviceInfo(pinAsset: number, pin: IPin, objectId: string, roomName: string, pinNumber: number): ISyncDevice;
export declare const createDeviceId: (objectId: string, pinNumber: number, pinAsset: number) => string;
export declare const getDeviceIdInfo: (deviceId: string) => {
    pinNumber: number;
    objectId: string;
    pinAsset: number;
};
export declare const speedTypes: {
    [index: number]: string;
};
export declare const categorizeFanSpeed: (value: number) => string;
export declare const deCategorizeFanSpeed: (speed: string) => number;
