/**
 * Communicates with Firestore for a user's devices to control them or read
 * the current state.
 */
import { SmartHomeV1SyncDevices, SmartHomeV1ExecuteRequestExecution } from 'actions-on-google';
import { ApiClientObjectMap } from 'actions-on-google/dist/common';
export declare function userExists(userId: string): Promise<boolean>;
export declare function getUserId(accessToken: string): Promise<string>;
export declare function homegraphEnabled(userId: string): Promise<boolean>;
export declare function setHomegraphEnable(userId: string, enable: boolean): Promise<void>;
export declare function updateDevice(userId: string, deviceId: string, name: string, nickname: string, states: ApiClientObjectMap<string | boolean | number>, localDeviceId: string, errorCode: string, tfa: string): Promise<void>;
export declare function addDevice(userId: string, data: ApiClientObjectMap<string | boolean | number>): Promise<void>;
export declare function deleteDevice(userId: string, deviceId: string): Promise<void>;
export declare function getDevices(userId: string): Promise<SmartHomeV1SyncDevices[]>;
export declare function getState(userId: string, deviceId: string): Promise<StatesMap>;
export declare type StatesMap = ApiClientObjectMap<any>;
export declare function execute(userId: string, deviceId: string, execution: SmartHomeV1ExecuteRequestExecution): Promise<StatesMap>;
export declare function disconnect(userId: string): Promise<void>;
