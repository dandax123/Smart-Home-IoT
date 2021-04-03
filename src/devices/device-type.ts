import {createDeviceId} from '../utils/device-utils';
import {IDevice, IPin, ISyncDevice} from '../utils/types';
const type = 'action.devices.types.FAN';

export class FakeDevice implements IDevice {
  deviceId: string;
  roomName: string;
  pinAsset: Number;
  value: number;
  controlType: 'switch' | 'control';
  name: string;
  roomHint: string[];
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
    this.roomHint = [`${this.roomName}`];
    this.nickNames = [];
  }
  async getRoomHint() {}
  async getNicknames() {}
  createDevice(): ISyncDevice {
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
