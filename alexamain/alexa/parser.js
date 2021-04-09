const { getDeviceIdInfo } = require("../device-utils");
const axios = require("axios");
const {
  ApplicationId,
  ConstantParseServerDeviceUrl,
  ConstantParseServerLoginUrl,
  ConstApplicationId,
  ConstParseSessionToken,
  ConstRevocableSession,
} = require("../constants");
const { reduce } = require("p-iteration");

// const devicesNumber = [1, 2, 3, 4];
const _parseHeaders = (applicationId, sessionToken) => {
  return {
    [ConstApplicationId]: applicationId,
    "Content-Type": "application/json",
    ...(sessionToken && { [ConstParseSessionToken]: sessionToken }),
  };
};

// export const loginUser = async (username, password) => {
//   const headers = _parseHeaders(ApplicationId);
//   headers[ConstRevocableSession] = "1";
//   const url = ConstantParseServerLoginUrl;
//   const { data } = await axios.get(url, {
//     headers,
//     params: {
//       username,
//       password,
//     },
//   });
//   return data;
// };

exports.getUserDevices = async (sessionToken) => {
  const headers = _parseHeaders(ApplicationId, sessionToken);
  try {
    const { data: parserDevices } = await axios.get(
      ConstantParseServerDeviceUrl,
      {
        headers,
      }
    );
    return parserDevices.results;
    //handle creating of device-types
  } catch (err) {
    return [];
  }
};
exports.getDeviceState = async (sessionToken, deviceId) => {
  const headers = _parseHeaders(ApplicationId);
  headers[ConstParseSessionToken] = sessionToken;
  const { pinNumber, objectId, pinAsset } = getDeviceIdInfo(deviceId);
  const { data } = await axios.get(
    ConstantParseServerDeviceUrl + `/${objectId}`,
    { headers }
  );
  return data[`pin${pinNumber}`];
};

exports.deviceUpdate = async (sessionToken, deviceId, newValue) => {
  const headers = _parseHeaders(ApplicationId);
  const { pinNumber, objectId, pinAsset } = getDeviceIdInfo(deviceId);
  headers[ConstParseSessionToken] = sessionToken;

  const url = ConstantParseServerDeviceUrl + `/${objectId}`;
  let res;
  try {
    const { data } = await axios.get(
      ConstantParseServerDeviceUrl + `/${objectId}`,
      { headers }
    );
    res = await axios.put(
      url,
      {
        [`pin${pinNumber}`]: {
          pin_name: pinName,
          type: data[`pin${pinNumber}`].type,
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
// const getDeviceStateInfo = async (deviceId: string, sessionToken: string) => {
//   const headers = _parseHeaders(ApplicationId as string, sessionToken);
//   const { pinNumber: pin, objectId, pinAsset } = getDeviceIdInfo(deviceId);
//   try {
//     const { data } = await axios.get(
//       ConstantParseServerDeviceUrl + `/${objectId}`,
//       { headers }
//     );
//     return {
//       online: true,
//       on: Boolean(Number(data[`pin${pin}`].value)),
//       ...(pinAsset === 0 && {
//         thermostatTemperatureSetpoint: data[`pin${pin}`].value,
//       }),
//       ...(pinAsset === 1 && {
//         currentFanSpeedPercent: data[`pin${pin}`].value,
//         currentFanSpeedSetting: categorizeFanSpeed(data[`pin${pin}`].value),
//       }),
//       ...(pinAsset === 2 && {
//         brightness: data[`pin${pin}`].value,
//       }),
//       ...(pinAsset === 5 && {
//         temperatureSetpointCelsius: data[`pin${pin}`].value,
//       }),
//     };
//   } catch (err) {
//     return {
//       status: "ERROR",
//       errorCode: "deviceOffline",
//     };
//   }
// };
// export const updateSingleDevice = async (
//   sessionToken: string,
//   deviceId: string,
//   newValue: number
// ) => {
//   const { pinNumber: pin, objectId } = getDeviceIdInfo(deviceId);

//   const headers = _parseHeaders(ApplicationId as string, sessionToken);
//   try {
//     const { data } = await axios.get(
//       ConstantParseServerDeviceUrl + `/${objectId}`,
//       { headers }
//     );
//     await axios.put(
//       ConstantParseServerDeviceUrl + `/${objectId}`,
//       {
//         [`pin${pin}`]: { ...data[`pin${pin}`], value: newValue },
//       },
//       { headers }
//     );
//     return {
//       ids: [deviceId],
//       states: await getDeviceStateInfo(deviceId, sessionToken),
//       status: "SUCCESS",
//     };
//   } catch (err) {
//     return {
//       ids: [deviceId],
//       status: "ERROR",
//       errorCode: "deviceOffline",
//     };
//   }
// };
// export async function executeDeviceUpdate(
//   sessionToken: string,
//   deviceId: string,
//   execution: SmartHomeV1ExecuteRequestExecution
// ): Promise<any> {
//   switch (execution.command) {
//     // action.devices.traits.Brightness
//     case "action.devices.commands.BrightnessAbsolute": {
//       const { brightness } = execution.params!;
//       return updateSingleDevice(sessionToken, deviceId, brightness);
//     }

//     // action.devices.traits.FanSpeed
//     case "action.devices.commands.SetFanSpeed": {
//       const { fanSpeed, fanSpeedPercent } = execution.params!;
//       if (fanSpeed) {
//         return updateSingleDevice(
//           sessionToken,
//           deviceId,
//           deCategorizeFanSpeed(fanSpeed)
//         );
//       } else if (fanSpeedPercent) {
//         return updateSingleDevice(sessionToken, deviceId, fanSpeedPercent);
//       }
//       break;
//     }

//     // action.devices.traits.OnOff
//     case "action.devices.commands.OnOff": {
//       const { on } = execution.params!;
//       return updateSingleDevice(sessionToken, deviceId, Number(on) * 100);
//     }

//     // action.devices.traits.OpenClose

//     // action.devices.traits.TemperatureControl
//     case "action.devices.commands.SetTemperature": {
//       const { temperature } = execution.params!;
//       return updateSingleDevice(sessionToken, deviceId, temperature);
//     }

//     // action.devices.traits.TemperatureSetting
//     case "action.devices.commands.ThermostatTemperatureSetpoint": {
//       const { thermostatTemperatureSetpoint } = execution.params!;
//       return updateSingleDevice(
//         sessionToken,
//         deviceId,
//         thermostatTemperatureSetpoint
//       );
//     }

//     case "action.devices.commands.ThermostatTemperatureSetRange": {
//       const {
//         thermostatTemperatureSetpointLow,
//         thermostatTemperatureSetpointHigh,
//       } = execution.params!;
//       return updateSingleDevice(
//         sessionToken,
//         deviceId,
//         (thermostatTemperatureSetpointLow + thermostatTemperatureSetpointHigh) /
//           2
//       );
//     }
//     default:
//       return {
//         ids: [deviceId],
//         status: "ERROR",
//         errorCode: "deviceOffline",
//       };
//   }
// }
