import { IHeader, ISyncDevice } from '../utils/types';
import { SmartHomeV1ExecuteRequestExecution } from 'actions-on-google';
export declare const _parseHeaders: (applicationId: string, sessionToken?: string | undefined) => IHeader;
export declare const loginUser: (username: string, password: string) => Promise<any>;
export declare const getUserDevices: (sessionToken: string) => Promise<ISyncDevice[]>;
export declare const getDeviceState: (sessionToken: string, ids: string[]) => Promise<{}>;
export declare const deviceUpdate: (sessionToken: string, objectId: string, pinNumber: number, pinName: string, newValue: number, type: 'switch' | 'control') => Promise<import("axios").AxiosResponse<any> | undefined>;
export declare const updateSingleDevice: (sessionToken: string, deviceId: string, newValue: number) => Promise<{
    ids: string[];
    states: {
        temperatureSetpointCelsius?: any;
        brightness?: any;
        currentFanSpeedPercent?: any;
        currentFanSpeedSetting?: string | undefined;
        thermostatTemperatureSetpoint?: any;
        online: boolean;
        on: boolean;
        status?: undefined;
        errorCode?: undefined;
    } | {
        status: string;
        errorCode: string;
    };
    status: string;
    errorCode?: undefined;
} | {
    ids: string[];
    status: string;
    errorCode: string;
    states?: undefined;
}>;
export declare function executeDeviceUpdate(sessionToken: string, deviceId: string, execution: SmartHomeV1ExecuteRequestExecution): Promise<any>;
