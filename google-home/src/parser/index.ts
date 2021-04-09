import axios from 'axios';
import {IHeader, IPin, ISyncDevice} from '../utils/types';
import {
  categorizeFanSpeed,
  deCategorizeFanSpeed,
  getDeviceIdInfo,
  getDeviceInfo,
} from '../utils/device-utils';
import {
  ApplicationId,
  ConstantParseServerDeviceUrl,
  ConstantParseServerLoginUrl,
  ConstApplicationId,
  ConstParseSessionToken,
  ConstRevocableSession,
} from '../constants';
import {reduce} from 'p-iteration';
import {SmartHomeV1ExecuteRequestExecution} from 'actions-on-google';

const devicesNumber = [1, 2, 3, 4];
export const _parseHeaders = (
  applicationId: string,
  sessionToken?: string
): IHeader => {
  return {
    [ConstApplicationId]: applicationId,
    'Content-Type': 'application/json',
    ...(sessionToken && {[ConstParseSessionToken]: sessionToken}),
  };
};

export const loginUser = async (username: string, password: string) => {
  const headers = _parseHeaders(ApplicationId as string);
  headers[ConstRevocableSession] = '1';
  const url = ConstantParseServerLoginUrl;
  const {data} = await axios.get(url, {
    headers,
    params: {
      username,
      password,
    },
  });
  return data;
};

export const getUserDevices = async (
  sessionToken: string
): Promise<ISyncDevice[]> => {
  const headers = _parseHeaders(ApplicationId as string, sessionToken);
  try {
    const {data: parserDevices} = await axios.get(
      ConstantParseServerDeviceUrl,
      {
        headers,
      }
    );
    const myDevices: ISyncDevice[] = [];
    await parserDevices.results.reduce((acc: any, data: any) => {
      const devices: ISyncDevice[] = devicesNumber.map(i => {
        const pin: IPin = data[`pin${i}`];
        const roomName: string = data.roomName;
        const objectId: string = data.objectId;
        const pinAsset = Number(data[`pin${i}Asset`]);
        const device: ISyncDevice = getDeviceInfo(
          pinAsset,
          pin,
          objectId,
          roomName,
          i
        );
        myDevices.push(device);
        return device;
      });
      return acc;
    }, []);
    //handle creating of device-types

    return myDevices;
  } catch (err) {
    return [];
  }
};
export const getDeviceState = async (sessionToken: string, ids: string[]) => {
  const deviceState = reduce(
    ids,
    async (acc, deviceId) => {
      return {
        ...acc,
        [deviceId]: await getDeviceStateInfo(deviceId, sessionToken),
      };
    },
    {}
  );
  return deviceState;
};

export const deviceUpdate = async (
  sessionToken: string,
  objectId: string,
  pinNumber: number,
  pinName: string,
  newValue: number,
  type: 'switch' | 'control'
) => {
  const headers = _parseHeaders(ApplicationId as string);
  headers[ConstParseSessionToken] = sessionToken;

  const url = ConstantParseServerDeviceUrl + `/${objectId}`;
  let res;
  try {
    res = await axios.put(
      url,
      {
        [`pin${pinNumber}`]: {
          pin_name: pinName,
          type,
          value: newValue,
        },
      },
      {
        headers: headers,
      }
    );
  } catch (e) {
    console.log(e);
  }
  return res;
};
const getDeviceStateInfo = async (deviceId: string, sessionToken: string) => {
  const headers = _parseHeaders(ApplicationId as string, sessionToken);
  const {pinNumber: pin, objectId, pinAsset} = getDeviceIdInfo(deviceId);
  try {
    const {data} = await axios.get(
      ConstantParseServerDeviceUrl + `/${objectId}`,
      {headers}
    );
    return {
      online: true,
      on: Boolean(Number(data[`pin${pin}`].value)),
      ...(pinAsset === 0 && {
        thermostatTemperatureSetpoint: data[`pin${pin}`].value,
      }),
      ...(pinAsset === 1 && {
        currentFanSpeedPercent: data[`pin${pin}`].value,
        currentFanSpeedSetting: categorizeFanSpeed(data[`pin${pin}`].value),
      }),
      ...(pinAsset === 2 && {
        brightness: data[`pin${pin}`].value,
      }),
      ...(pinAsset === 5 && {
        temperatureSetpointCelsius: data[`pin${pin}`].value,
      }),
    };
  } catch (err) {
    return {
      status: 'ERROR',
      errorCode: 'deviceOffline',
    };
  }
};
export const updateSingleDevice = async (
  sessionToken: string,
  deviceId: string,
  newValue: number
) => {
  const {pinNumber: pin, objectId} = getDeviceIdInfo(deviceId);

  const headers = _parseHeaders(ApplicationId as string, sessionToken);
  try {
    const {data} = await axios.get(
      ConstantParseServerDeviceUrl + `/${objectId}`,
      {headers}
    );
    await axios.put(
      ConstantParseServerDeviceUrl + `/${objectId}`,
      {
        [`pin${pin}`]: {...data[`pin${pin}`], value: newValue},
      },
      {headers}
    );
    return {
      ids: [deviceId],
      states: await getDeviceStateInfo(deviceId, sessionToken),
      status: 'SUCCESS',
    };
  } catch (err) {
    return {
      ids: [deviceId],
      status: 'ERROR',
      errorCode: 'deviceOffline',
    };
  }
};
export async function executeDeviceUpdate(
  sessionToken: string,
  deviceId: string,
  execution: SmartHomeV1ExecuteRequestExecution
): Promise<any> {
  switch (execution.command) {
    // action.devices.traits.Brightness
    case 'action.devices.commands.BrightnessAbsolute': {
      const {brightness} = execution.params!;
      return updateSingleDevice(sessionToken, deviceId, brightness);
    }

    // action.devices.traits.FanSpeed
    case 'action.devices.commands.SetFanSpeed': {
      const {fanSpeed, fanSpeedPercent} = execution.params!;
      if (fanSpeed) {
        return updateSingleDevice(
          sessionToken,
          deviceId,
          deCategorizeFanSpeed(fanSpeed)
        );
      } else if (fanSpeedPercent) {
        return updateSingleDevice(sessionToken, deviceId, fanSpeedPercent);
      }
      break;
    }

    // action.devices.traits.OnOff
    case 'action.devices.commands.OnOff': {
      const {on} = execution.params!;
      return updateSingleDevice(sessionToken, deviceId, Number(on) * 100);
    }

    // action.devices.traits.OpenClose

    // action.devices.traits.TemperatureControl
    case 'action.devices.commands.SetTemperature': {
      const {temperature} = execution.params!;
      return updateSingleDevice(sessionToken, deviceId, temperature);
    }

    // action.devices.traits.TemperatureSetting
    case 'action.devices.commands.ThermostatTemperatureSetpoint': {
      const {thermostatTemperatureSetpoint} = execution.params!;
      return updateSingleDevice(
        sessionToken,
        deviceId,
        thermostatTemperatureSetpoint
      );
    }

    case 'action.devices.commands.ThermostatTemperatureSetRange': {
      const {
        thermostatTemperatureSetpointLow,
        thermostatTemperatureSetpointHigh,
      } = execution.params!;
      return updateSingleDevice(
        sessionToken,
        deviceId,
        (thermostatTemperatureSetpointLow + thermostatTemperatureSetpointHigh) /
          2
      );
    }
    default:
      return {
        ids: [deviceId],
        status: 'ERROR',
        errorCode: 'deviceOffline',
      };
  }
}
