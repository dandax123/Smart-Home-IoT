import {FakeDevice} from '../devices/device-type';
import {AcUnit} from '../devices/ac-unit';
import {Fan} from '../devices/fan';
import {Light} from '../devices/light';
import {Outlet} from '../devices/outlet';
import {WaterHeater} from '../devices/water-heater';
import {Tv} from '../devices/tv';
import {DeviceTypes, IPin, ISyncDevice} from './types';
export function getDeviceInfo(
  pinAsset: number,
  pin: IPin,
  objectId: string,
  roomName: string,
  pinNumber: number
): ISyncDevice {
  switch (pinAsset) {
    case DeviceTypes.AIR_CONDITIONER:
      return new AcUnit(
        objectId,
        pin,
        pinAsset,
        roomName,
        pinNumber
      ).createDevice();
    case DeviceTypes.FAN:
      return new Fan(
        objectId,
        pin,
        pinAsset,
        roomName,
        pinNumber
      ).createDevice();
    case DeviceTypes.LIGHT:
      return new Light(
        objectId,
        pin,
        pinAsset,
        roomName,
        pinNumber
      ).createDevice();
    case DeviceTypes.OUTLET:
      return new Outlet(
        objectId,
        pin,
        pinAsset,
        roomName,
        pinNumber
      ).createDevice();
    case DeviceTypes.WATER_HEATER:
      return new WaterHeater(
        objectId,
        pin,
        pinAsset,
        roomName,
        pinNumber
      ).createDevice();
    case DeviceTypes.TV:
      return new Tv(
        objectId,
        pin,
        pinAsset,
        roomName,
        pinNumber
      ).createDevice();
    default:
      return new FakeDevice(
        objectId,
        pin,
        pinAsset,
        roomName,
        pinNumber
      ).createDevice();
  }
}
export const createDeviceId = (
  objectId: string,
  pinNumber: number,
  pinAsset: number
): string => {
  return (
    objectId +
    '_' +
    Math.random().toString(36).substr(2, 19) +
    `_${pinNumber}` +
    `_${pinAsset}`
  );
};
export const getDeviceIdInfo = (
  deviceId: string
): {pinNumber: number; objectId: string; pinAsset: number} => {
  return {
    pinNumber: Number(deviceId.split('_')[2]),
    objectId: deviceId.split('_')[0],
    pinAsset: Number(deviceId.split('_')[3]),
  };
};

export const speedTypes: {[index: number]: string} = {
  0: 'off',
  1: 'low',
  2: 'medium',
  3: 'high',
};
export const categorizeFanSpeed = (value: number): string => {
  const normalized_speed = Number(((value / 100) * 3).toFixed());
  return speedTypes[normalized_speed];
};
export const deCategorizeFanSpeed = (speed: string): number => {
  switch (speed) {
    case 'off':
      return 0;
    case 'low':
      return 35;
    case 'medium':
      return 50;
    case 'high':
      return 100;
    default:
      return 0;
  }
};
