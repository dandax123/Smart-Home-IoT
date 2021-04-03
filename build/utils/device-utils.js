"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deCategorizeFanSpeed = exports.categorizeFanSpeed = exports.speedTypes = exports.getDeviceIdInfo = exports.createDeviceId = exports.getDeviceInfo = void 0;
const device_type_1 = require("../devices/device-type");
const ac_unit_1 = require("../devices/ac-unit");
const fan_1 = require("../devices/fan");
const light_1 = require("../devices/light");
const outlet_1 = require("../devices/outlet");
const water_heater_1 = require("../devices/water-heater");
const tv_1 = require("../devices/tv");
const types_1 = require("./types");
function getDeviceInfo(pinAsset, pin, objectId, roomName, pinNumber) {
    switch (pinAsset) {
        case types_1.DeviceTypes.AIR_CONDITIONER:
            return new ac_unit_1.AcUnit(objectId, pin, pinAsset, roomName, pinNumber).createDevice();
        case types_1.DeviceTypes.FAN:
            return new fan_1.Fan(objectId, pin, pinAsset, roomName, pinNumber).createDevice();
        case types_1.DeviceTypes.LIGHT:
            return new light_1.Light(objectId, pin, pinAsset, roomName, pinNumber).createDevice();
        case types_1.DeviceTypes.OUTLET:
            return new outlet_1.Outlet(objectId, pin, pinAsset, roomName, pinNumber).createDevice();
        case types_1.DeviceTypes.WATER_HEATER:
            return new water_heater_1.WaterHeater(objectId, pin, pinAsset, roomName, pinNumber).createDevice();
        case types_1.DeviceTypes.TV:
            return new tv_1.Tv(objectId, pin, pinAsset, roomName, pinNumber).createDevice();
        default:
            return new device_type_1.FakeDevice(objectId, pin, pinAsset, roomName, pinNumber).createDevice();
    }
}
exports.getDeviceInfo = getDeviceInfo;
const createDeviceId = (objectId, pinNumber, pinAsset) => {
    return (objectId +
        '_' +
        Math.random().toString(36).substr(2, 19) +
        `_${pinNumber}` +
        `_${pinAsset}`);
};
exports.createDeviceId = createDeviceId;
const getDeviceIdInfo = (deviceId) => {
    return {
        pinNumber: Number(deviceId.split('_')[2]),
        objectId: deviceId.split('_')[0],
        pinAsset: Number(deviceId.split('_')[3]),
    };
};
exports.getDeviceIdInfo = getDeviceIdInfo;
exports.speedTypes = {
    0: 'off',
    1: 'low',
    2: 'medium',
    3: 'high',
};
const categorizeFanSpeed = (value) => {
    const normalized_speed = Number(((value / 100) * 3).toFixed());
    return exports.speedTypes[normalized_speed];
};
exports.categorizeFanSpeed = categorizeFanSpeed;
const deCategorizeFanSpeed = (speed) => {
    return (Number(Object.keys(exports.speedTypes).find((key) => exports.speedTypes[key] === speed)) * 30);
};
exports.deCategorizeFanSpeed = deCategorizeFanSpeed;
//# sourceMappingURL=device-utils.js.map