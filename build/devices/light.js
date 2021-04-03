"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Light = void 0;
const device_utils_1 = require("../utils/device-utils");
const type = 'action.devices.types.LIGHT';
class Light {
    constructor(objectId, pin, _pinAsset, _roomName, pinNumber) {
        this.deviceId = device_utils_1.createDeviceId(objectId, pinNumber, _pinAsset);
        this.controlType = pin.type;
        this.value = pin.value;
        this.pinAsset = _pinAsset;
        this.roomName = _roomName;
        this.name = pin.pin_name;
        this.roomHint = this.roomName;
        this.nickNames = [];
    }
    createDevice() {
        return {
            id: this.deviceId,
            type,
            traits: [
                'action.devices.traits.Brightness',
                'action.devices.traits.OnOff',
            ],
            name: {
                defaultNames: [
                    `${this.name}`,
                    `Smart ${this.name}`,
                    `${this.roomName} ${this.name}`,
                ],
                name: this.name,
                nicknames: this.nickNames,
            },
            roomHint: this.roomHint,
            willReportState: false,
        };
    }
}
exports.Light = Light;
//# sourceMappingURL=light.js.map