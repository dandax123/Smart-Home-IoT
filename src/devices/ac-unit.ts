import {createDeviceId} from '../utils/device-utils';
import {IDevice, IPin, ISyncDevice} from '../utils/types';

const type = 'action.devices.types.AC_UNIT';

export class AcUnit implements IDevice {
  deviceId: string;
  roomName: string;
  pinAsset: Number;
  value: number;
  controlType: 'switch' | 'control';
  name: string;
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
    this.nickNames = [
      `${this.name}`,
      `${this.roomName} ac`,
      `my ${this.roomName} ${this.name}`,
      `smart ${this.roomName} ${this.name}`,
    ];
  }

  createDevice(): ISyncDevice {
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
