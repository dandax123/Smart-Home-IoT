"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tv = void 0;
const device_utils_1 = require("../utils/device-utils");
const type = 'action.devices.types.TV';
class Tv {
    constructor(objectId, pin, _pinAsset, _roomName, pinNumber) {
        this.deviceId = device_utils_1.createDeviceId(objectId, pinNumber, _pinAsset);
        this.controlType = pin.type;
        this.value = pin.value;
        this.pinAsset = _pinAsset;
        this.roomName = _roomName;
        this.name = pin.pin_name;
        this.roomHint = this.roomName;
        this.nickNames = [
            `${this.roomName} tv`,
            `my ${this.roomName} ${this.name}`,
        ];
    }
    createDevice() {
        return {
            id: this.deviceId,
            type,
            traits: ['action.devices.traits.OnOff'],
            name: {
                nicknames: this.nickNames,
                defaultNames: [this.name, `Smart ${this.name}`],
                name: this.name,
            },
            roomHint: this.roomHint,
            willReportState: false,
        };
    }
}
exports.Tv = Tv;
//# sourceMappingURL=tv.js.map