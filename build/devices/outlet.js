"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Outlet = void 0;
const device_utils_1 = require("../utils/device-utils");
const type = 'action.devices.types.OUTLET';
class Outlet {
    constructor(objectId, pin, _pinAsset, _roomName, pinNumber) {
        this.deviceId = device_utils_1.createDeviceId(objectId, pinNumber, _pinAsset);
        this.controlType = pin.type;
        this.value = pin.value;
        this.pinAsset = _pinAsset;
        this.roomName = _roomName;
        this.name = pin.pin_name;
        this.nickNames = [
            `${this.roomName} ${this.name}`,
            'smart plug',
            'wall outlet',
        ];
        this.roomHint = this.roomName;
    }
    createDevice() {
        return {
            id: this.deviceId,
            type,
            traits: ['action.devices.traits.OnOff'],
            name: {
                name: this.name,
                defaultNames: [`${this.name}`, `${this.roomName} ${this.name}`],
                nicknames: this.nickNames,
            },
            roomHint: this.roomHint,
            willReportState: false,
        };
    }
}
exports.Outlet = Outlet;
//# sourceMappingURL=outlet.js.map