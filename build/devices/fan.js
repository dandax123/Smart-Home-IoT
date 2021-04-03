"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fan = void 0;
const device_utils_1 = require("../utils/device-utils");
const type = 'action.devices.types.FAN';
class Fan {
    constructor(objectId, pin, _pinAsset, _roomName, pinNumber) {
        this.deviceId = device_utils_1.createDeviceId(objectId, pinNumber, _pinAsset);
        this.controlType = pin.type;
        this.value = pin.value;
        this.pinAsset = _pinAsset;
        this.roomName = _roomName;
        this.name = pin.pin_name;
        this.roomHint = this.roomName;
        this.nickNames = [
            `${this.roomName} fan`,
            `my ${this.roomName} ${this.name}`,
        ];
    }
    createDevice() {
        return {
            id: this.deviceId,
            type,
            traits: ['action.devices.traits.FanSpeed', 'action.devices.traits.OnOff'],
            name: {
                defaultNames: ['Smart Fan'],
                name: this.name,
                nicknames: this.nickNames,
            },
            roomHint: this.roomHint,
            willReportState: false,
            attributes: {
                availableFanSpeeds: {
                    speeds: [
                        {
                            speed_name: 'off',
                            speed_values: [
                                {
                                    speed_synonym: ['off'],
                                    lang: 'en',
                                },
                            ],
                        },
                        {
                            speed_name: 'low',
                            speed_values: [
                                {
                                    speed_synonym: ['low'],
                                    lang: 'en',
                                },
                            ],
                        },
                        {
                            speed_name: 'medium',
                            speed_values: [
                                {
                                    speed_synonym: ['medium'],
                                    lang: 'en',
                                },
                            ],
                        },
                        {
                            speed_name: 'high',
                            speed_values: [
                                {
                                    speed_synonym: ['high'],
                                    lang: 'en',
                                },
                            ],
                        },
                    ],
                    ordered: true,
                },
                supportsFanSpeedPercent: true,
                reversible: true,
            },
        };
    }
}
exports.Fan = Fan;
//# sourceMappingURL=fan.js.map