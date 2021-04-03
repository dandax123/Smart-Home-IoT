"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaterHeater = void 0;
const device_utils_1 = require("../utils/device-utils");
const type = 'action.devices.types.WATERHEATER';
class WaterHeater {
    constructor(objectId, pin, _pinAsset, _roomName, pinNumber) {
        this.deviceId = device_utils_1.createDeviceId(objectId, pinNumber, _pinAsset);
        this.controlType = pin.type;
        this.value = pin.value;
        this.pinAsset = _pinAsset;
        this.roomName = _roomName;
        this.name = pin.pin_name;
        this.nickNames = [
            `${this.roomName} water-heater`,
            `my ${this.roomName} ${this.name}`,
            `smart ${this.roomName} ${this.name}`,
        ];
    }
    createDevice() {
        return {
            id: this.deviceId,
            type,
            traits: [
                'action.devices.traits.OnOff',
                'action.devices.traits.TemperatureControl',
            ],
            name: {
                defaultNames: this.nickNames,
                nicknames: this.nickNames,
                name: this.name,
            },
            roomHint: this.roomName,
            willReportState: false,
            states: {
                online: true,
                on: Boolean(this.value),
            },
        };
    }
}
exports.WaterHeater = WaterHeater;
//# sourceMappingURL=water-heater.js.map