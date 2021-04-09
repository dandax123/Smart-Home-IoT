import {createDeviceId} from '../utils/device-utils';
import {IDevice, IPin, ISyncDevice} from '../utils/types';

const type = 'action.devices.types.OUTLET';

export class Outlet implements IDevice {
  deviceId: string;
  roomName: string;
  pinAsset: Number;
  value: number;
  controlType: 'switch' | 'control';
  name: string;
  nickNames: string[];
  roomHint: string;

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
      `${this.roomName} ${this.name}`,
      'smart plug',
      'wall outlet',
    ];
    this.roomHint = this.roomName;
  }

  createDevice(): ISyncDevice {
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
