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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeDeviceUpdate = exports.updateSingleDevice = exports.deviceUpdate = exports.getDeviceState = exports.getUserDevices = exports.loginUser = exports._parseHeaders = void 0;
const axios_1 = __importDefault(require("axios"));
const functions = __importStar(require("firebase-functions"));
const device_utils_1 = require("../utils/device-utils");
const constants_1 = require("../constants");
const p_iteration_1 = require("p-iteration");
const devicesNumber = [1, 2, 3, 4];
const _parseHeaders = (applicationId, sessionToken) => {
    return {
        [constants_1.ConstApplicationId]: applicationId,
        'Content-Type': 'application/json',
        ...(sessionToken && { [constants_1.ConstParseSessionToken]: sessionToken }),
    };
};
exports._parseHeaders = _parseHeaders;
const loginUser = async (username, password) => {
    const headers = exports._parseHeaders(constants_1.ApplicationId);
    headers[constants_1.ConstRevocableSession] = '1';
    const url = constants_1.ConstantParseServerLoginUrl;
    const { data } = await axios_1.default.get(url, {
        headers,
        params: {
            username,
            password,
        },
    });
    return data;
};
exports.loginUser = loginUser;
const getUserDevices = async (sessionToken) => {
    const headers = exports._parseHeaders(constants_1.ApplicationId, sessionToken);
    try {
        const { data: parserDevices } = await axios_1.default.get(constants_1.ConstantParseServerDeviceUrl, {
            headers,
        });
        const myDevices = [];
        await parserDevices.results.reduce((acc, data) => {
            const devices = devicesNumber.map(i => {
                const pin = data[`pin${i}`];
                const roomName = data.roomName;
                const objectId = data.objectId;
                const pinAsset = Number(data[`pin${i}Asset`]);
                const device = device_utils_1.getDeviceInfo(pinAsset, pin, objectId, roomName, i);
                myDevices.push(device);
                return device;
            });
            return acc;
        }, []);
        //handle creating of device-types
        return myDevices;
    }
    catch (err) {
        return [];
    }
};
exports.getUserDevices = getUserDevices;
const getDeviceState = async (sessionToken, ids) => {
    const deviceState = p_iteration_1.reduce(ids, async (acc, deviceId) => {
        return {
            ...acc,
            [deviceId]: await getDeviceStateInfo(deviceId, sessionToken),
        };
    }, {});
    return deviceState;
};
exports.getDeviceState = getDeviceState;
const deviceUpdate = async (sessionToken, objectId, pinNumber, pinName, newValue, type) => {
    const headers = exports._parseHeaders(constants_1.ApplicationId);
    headers[constants_1.ConstParseSessionToken] = sessionToken;
    const url = constants_1.ConstantParseServerDeviceUrl + `/${objectId}`;
    let res;
    try {
        res = await axios_1.default.put(url, {
            [`pin${pinNumber}`]: {
                pin_name: pinName,
                type,
                value: newValue,
            },
        }, {
            headers: headers,
        });
    }
    catch (e) {
        console.log(e);
    }
    return res;
};
exports.deviceUpdate = deviceUpdate;
const getDeviceStateInfo = async (deviceId, sessionToken) => {
    const headers = exports._parseHeaders(constants_1.ApplicationId, sessionToken);
    const { pinNumber: pin, objectId, pinAsset } = device_utils_1.getDeviceIdInfo(deviceId);
    try {
        const { data } = await axios_1.default.get(constants_1.ConstantParseServerDeviceUrl + `/${objectId}`, { headers });
        return {
            online: true,
            on: Boolean(Number(data[`pin${pin}`].value)),
            ...(pinAsset === 0 && {
                thermostatTemperatureSetpoint: data[`pin${pin}`].value,
            }),
            ...(pinAsset === 1 && {
                currentFanSpeedPercent: data[`pin${pin}`].value,
                currentFanSpeedSetting: device_utils_1.categorizeFanSpeed(data[`pin${pin}`].value),
            }),
            ...(pinAsset === 2 && {
                brightness: data[`pin${pin}`].value,
            }),
            ...(pinAsset === 5 && {
                temperatureSetpointCelsius: data[`pin${pin}`].value,
            }),
        };
    }
    catch (err) {
        return {
            status: 'ERROR',
            errorCode: 'deviceOffline',
        };
    }
};
const updateSingleDevice = async (sessionToken, deviceId, newValue) => {
    const { pinNumber: pin, objectId } = device_utils_1.getDeviceIdInfo(deviceId);
    const headers = exports._parseHeaders(constants_1.ApplicationId, sessionToken);
    try {
        const { data } = await axios_1.default.get(constants_1.ConstantParseServerDeviceUrl + `/${objectId}`, { headers });
        await axios_1.default.put(constants_1.ConstantParseServerDeviceUrl + `/${objectId}`, {
            [`pin${pin}`]: { ...data[`pin${pin}`], value: newValue },
        }, { headers });
        return {
            ids: [deviceId],
            states: await getDeviceStateInfo(deviceId, sessionToken),
            status: 'SUCCESS',
        };
    }
    catch (err) {
        functions.logger.error('update-error', err);
        return {
            ids: [deviceId],
            status: 'ERROR',
            errorCode: 'deviceOffline',
        };
    }
};
exports.updateSingleDevice = updateSingleDevice;
async function executeDeviceUpdate(sessionToken, deviceId, execution) {
    switch (execution.command) {
        // action.devices.traits.Brightness
        case 'action.devices.commands.BrightnessAbsolute': {
            const { brightness } = execution.params;
            return exports.updateSingleDevice(sessionToken, deviceId, brightness);
        }
        // action.devices.traits.FanSpeed
        case 'action.devices.commands.SetFanSpeed': {
            const { fanSpeed, fanSpeedPercent } = execution.params;
            if (fanSpeed) {
                return exports.updateSingleDevice(sessionToken, deviceId, device_utils_1.deCategorizeFanSpeed(fanSpeed));
            }
            else if (fanSpeedPercent) {
                return exports.updateSingleDevice(sessionToken, deviceId, fanSpeedPercent);
            }
            break;
        }
        // action.devices.traits.OnOff
        case 'action.devices.commands.OnOff': {
            const { on } = execution.params;
            return exports.updateSingleDevice(sessionToken, deviceId, Number(on) * 100);
        }
        // action.devices.traits.OpenClose
        // action.devices.traits.TemperatureControl
        case 'action.devices.commands.SetTemperature': {
            const { temperature } = execution.params;
            return exports.updateSingleDevice(sessionToken, deviceId, temperature);
        }
        // action.devices.traits.TemperatureSetting
        case 'action.devices.commands.ThermostatTemperatureSetpoint': {
            const { thermostatTemperatureSetpoint } = execution.params;
            return exports.updateSingleDevice(sessionToken, deviceId, thermostatTemperatureSetpoint);
        }
        case 'action.devices.commands.ThermostatTemperatureSetRange': {
            const { thermostatTemperatureSetpointLow, thermostatTemperatureSetpointHigh, } = execution.params;
            return exports.updateSingleDevice(sessionToken, deviceId, (thermostatTemperatureSetpointLow + thermostatTemperatureSetpointHigh) /
                2);
        }
        default:
            return {
                ids: [deviceId],
                status: 'ERROR',
                errorCode: 'deviceOffline',
            };
    }
}
exports.executeDeviceUpdate = executeDeviceUpdate;
//# sourceMappingURL=index.js.map