"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcUnit = void 0;
const device_utils_1 = require("../utils/device-utils");
const type = 'action.devices.types.AC_UNIT';
class AcUnit {
    constructor(objectId, pin, _pinAsset, _roomName, pinNumber) {
        this.deviceId = device_utils_1.createDeviceId(objectId, pinNumber, _pinAsset);
        this.controlType = pin.type;
        this.value = pin.value;
        this.pinAsset = _pinAsset;
        this.roomName = _roomName;
        this.name = pin.pin_name;
        this.nickNames = [
            `${this.name}`,
            `${this.roomName} ac`,
            `my ${this.roomName} ${this.name}`,
            `smart ${this.roomName} ${this.name}`,
        ];
    }
    createDevice() {
        return {
            id: this.deviceId,
            type,
            traits: [
                'action.devices.traits.TemperatureSetting',
                'action.devices.traits.FanSpeed',
                'action.devices.traits.OnOff',
            ],
            name: {
                name: this.name,
                nicknames: this.nickNames,
                defaultNames: [this.name, `Smart ${this.name}`],
            },
            roomHint: this.roomName,
            attributes: {
                availableFanSpeeds: {
                    speeds: [
                        {
                            speed_name: 'low_key',
                            speed_values: [
                                {
                                    speed_synonym: ['low', 'slow'],
                                    lang: 'en',
                                },
                            ],
                        },
                        {
                            speed_name: 'high_key',
                            speed_values: [
                                {
                                    speed_synonym: ['high', 'speed 2'],
                                    lang: 'en',
                                },
                            ],
                        },
                    ],
                    ordered: true,
                },
                availableThermostatModes: ['off', 'cool', 'fan-only', 'on'],
                thermostatTemperatureUnit: 'C',
            },
            willReportState: false,
        };
    }
}
exports.AcUnit = AcUnit;
//# sourceMappingURL=ac-unit.js.map