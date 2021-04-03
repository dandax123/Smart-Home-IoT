"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeDevice = void 0;
const device_utils_1 = require("../utils/device-utils");
const type = 'action.devices.types.FAN';
class FakeDevice {
    constructor(objectId, pin, _pinAsset, _roomName, pinNumber) {
        this.deviceId = device_utils_1.createDeviceId(objectId, pinNumber, _pinAsset);
        this.controlType = pin.type;
        this.value = pin.value;
        this.pinAsset = _pinAsset;
        this.roomName = _roomName;
        this.name = pin.pin_name;
        this.roomHint = [`${this.roomName}`];
        this.nickNames = [];
    }
    async getRoomHint() { }
    async getNicknames() { }
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
        };
    }
}
exports.FakeDevice = FakeDevice;
//# sourceMappingURL=device-type.js.map