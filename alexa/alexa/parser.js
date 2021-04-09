const { getDeviceIdInfo } = require("../device-utils");
const axios = require("axios");
const {
  ApplicationId,
  ConstantParseServerDeviceUrl,
  ConstApplicationId,
  ConstParseSessionToken,
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
          pin_name: data[`pin${pinNumber}`].pin_name,
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
