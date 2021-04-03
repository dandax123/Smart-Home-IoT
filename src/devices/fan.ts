import {createDeviceId} from '../utils/device-utils';
import {IDevice, IPin, ISyncDevice} from '../utils/types';

const type = 'action.devices.types.FAN';

export class Fan implements IDevice {
  deviceId: string;
  roomName: string;
  pinAsset: Number;

  value: number;
  controlType: 'switch' | 'control';
  name: string;
  roomHint: string;
  nickNames: string[];
  constructor(
    objectId: string,
    pin: IPin,
    _pinAsset: number,
    _roomName: string,
    pinNumber: number
  ) {
    this.deviceId = createDeviceId(objectId, pinNumber, _pinAsset);
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

  createDevice(): ISyncDevice {
    return {
      id: this.deviceId,
      type,
      traits: ['action.devices.traits.FanSpeed', 'action.devices.traits.OnOff'],
      name: {
        defaultNames: [`Smart Fan`],
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
