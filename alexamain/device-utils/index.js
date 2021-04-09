exports.classifyDevices = (pinAsset, type) => {
  if (pinAsset !== 2 && type === "control") {
    return {
      type: "AlexaInterface",
      interface: "Alexa.PercentageController",
      version: "3",
      properties: {
        supported: [
          {
            name: "percentage",
          },
        ],
        proactivelyReported: true,
        retrievable: true,
      },
    };
  } else if (pinAsset == 2 && type === "control") {
    return {
      type: "AlexaInterface",
      interface: "Alexa.BrightnessController",
      version: "3",
      properties: {
        supported: [
          {
            name: "brightness",
          },
        ],
        proactivelyReported: true,
        retrievable: true,
      },
    };
  }
};
exports.createDeviceId = (objectId, pinNumber, pinAsset) => {
  return objectId + `_${pinNumber}` + `_${pinAsset}`;
};
exports.getDeviceIdInfo = (deviceId) => {
  return {
    pinNumber: Number(deviceId.split("_")[1]),
    objectId: deviceId.split("_")[0],
    pinAsset: Number(deviceId.split("_")[2]),
  };
};

exports.mapToDisplayCategory = (pinAsset) => {
  switch (pinAsset) {
    case 0:
      return ["AIR_PURIFIER"];
    case 1:
      return ["FAN"];
    case 2:
      return ["LIGHT"];
    case 3:
      return ["SMARTPLUG"];
    case 4:
      return ["TV"];
    case 5:
      return ["WATER_HEATER"];
    default:
      return ["OTHER"];
  }
};
