import type {Request, Response, NextFunction, Application} from 'express';
export interface NormalRequest {
  (req: Request, res: Response, next: NextFunction): any | Response;
}
export interface PassportUser {
  accessToken: string;
  refreshToken: string;
  profile: any;
  redirectUrl: string;
  state: string;
}
export interface Name {
  defaultNames: string[];
  name: string;
  nicknames: string[];
}

export interface DeviceInfo {
  manufacturer: string;
  model: string;
  hwVersion: string;
  swVersion: string;
}

export interface OtherDeviceId {
  deviceId: string;
}

export interface CustomData {
  fooValue: number;
  barValue: boolean;
  bazValue: string;
}

export interface ISyncDevice {
  id: string;
  type: string;
  traits: string[];
  name: Name;
  willReportState: boolean;
  roomHint: string;
  deviceInfo?: DeviceInfo;
  otherDeviceIds?: OtherDeviceId[];
  customData?: CustomData;
  attributes?: {[key: string]: any};
  states?: {[key: string]: any};
}
export enum DeviceTypes {
  AIR_CONDITIONER = 0,
  FAN = 1,
  LIGHT = 2,
  OUTLET = 3,
  TV = 4,
  WATER_HEATER = 5,
}
interface CustomRequest extends Request {
  user: PassportUser;
}
type controlType = 'switch' | 'control';
export interface IPin {
  pin_name: string;
  type: controlType;
  value: number;
}
export type IDevice = {
  deviceId: string;
  roomName: string;
  pinAsset: Number;
  value: number;
  controlType: controlType;
  name: string;
};
export interface ProtectedRequest {
  (req: CustomRequest, res: Response, next: NextFunction): any | Response;
}
export interface IHeader {
  [header_name: string]: string | number;
}
