"use strict";

let AlexaResponse = require("./alexa/alexa-response");
const {
  createDeviceId,
  classifyDevices,
  mapToDisplayCategory,
  getDeviceIdInfo,
} = require("./device-utils");
const {
  getUserDevices,
  deviceUpdate,
  getDeviceState,
} = require("./alexa/parser");

const extractUserId = (event) => {
  return event.directive.payload.scope.token;
};
const extractUsefulTokens = (event) => {
  return {
    deviceId: event.directive.endpoint.endpointId,
    userId: event.directive.endpoint.scope.token,
    correlationToken: event.directive.header.correlationToken,
  };
};
const devicesNumber = [1, 2, 3, 4];

exports.handler = async function (event, context) {
  // Dump the request for logging - check the CloudWatch logs
  console.log("index.handler request  -----");
  console.log(JSON.stringify(event));

  if (context !== undefined) {
    console.log("index.handler context  -----");
    console.log(JSON.stringify(context));
  }

  // Validate we have an Alexa directive
  if (!("directive" in event)) {
    let aer = new AlexaResponse({
      name: "ErrorResponse",
      payload: {
        type: "INVALID_DIRECTIVE",
        message: "Missing key: directive, Is request a valid Alexa directive?",
      },
    });
    return sendResponse(aer.get());
  }

  // Check the payload version
  if (event.directive.header.payloadVersion !== "3") {
    let aer = new AlexaResponse({
      name: "ErrorResponse",
      payload: {
        type: "INTERNAL_ERROR",
        message: "This skill only supports Smart Home API version 3",
      },
    });
    return sendResponse(aer.get());
  }

  let namespace = ((event.directive || {}).header || {}).namespace;

  if (namespace.toLowerCase() === "alexa.authorization") {
    let aar = new AlexaResponse({
      namespace: "Alexa.Authorization",
      name: "AcceptGrant.Response",
    });
    return sendResponse(aar.get());
  }
  if (namespace.toLowerCase() === "alexa") {
    const { deviceId, userId, correlationToken } = extractUsefulTokens(event);
    const { pinAsset } = getDeviceIdInfo(deviceId);
    let adr = new AlexaResponse({
      namespace: "Alexa",
      name: "StateReport",
      token: userId,
      endpointId: deviceId,
      correlationToken,
    });
    const deviceState = await getDeviceState(userId, deviceId);
    adr.addContextProperty({
      namespace: "Alexa.PowerController",
      name: "powerState",
      value: Boolean(Number(deviceState.value)) ? "ON" : "OFF",
    });
    if (pinAsset == 2 && deviceState.type == "control") {
      adr.addContextProperty({
        namespace: "Alexa.BrightnessController",
        name: "brightness",
        value: deviceState.value,
      });
    } else if (pinAsset != 2 && deviceState.type == "control") {
      adr.addContextProperty({
        namespace: "Alexa.PercentageController",
        name: "percentage",
        value: deviceState.value,
      });
    }
    return sendResponse(adr.get());
  }
  if (namespace.toLowerCase() === "alexa.discovery") {
    let adr = new AlexaResponse({
      namespace: "Alexa.Discovery",
      name: "Discover.Response",
    });
    const capability_alexa = adr.createPayloadEndpointCapability();
    const capability_powerController = adr.createPayloadEndpointCapability({
      interface: "Alexa.PowerController",
      supported: [{ name: "powerState" }],
    });
    const userId = extractUserId(event);
    const devices = await getUserDevices(userId);
    devices.map((data) => {
      devicesNumber.map((i) => {
        const device = data[`pin${i}`];
        const pinAsset = data[`pin${i}Asset`];
        const extraAbilties = classifyDevices(pinAsset, device.type);
        if (extraAbilties) {
          adr.addPayloadEndpoint({
            friendlyName: `${device.pin_name}`,
            endpointId: createDeviceId(data.objectId, i, pinAsset),
            capabilities: [
              capability_alexa,
              capability_powerController,
              extraAbilties,
            ],
            displayCategories: mapToDisplayCategory(pinAsset),
          });
        } else {
          adr.addPayloadEndpoint({
            friendlyName: `${device.pin_name}`,
            endpointId: createDeviceId(data.objectId, i, pinAsset),
            capabilities: [capability_alexa, capability_powerController],
            displayCategories: mapToDisplayCategory(pinAsset),
          });
        }
      });
    });
    return sendResponse(adr.get());
  }
  if (namespace.toLowerCase() == "alexa.brightnesscontroller") {
    const { deviceId, userId, correlationToken } = extractUsefulTokens(event);
    const deviceState = await getDeviceState(userId, deviceId);
    let newBrightness = deviceState.value;
    try {
      if ("brightness" in event.directive.payload) {
        let { brightness } = event.directive.payload;
        newBrightness = brightness;
        await deviceUpdate(userId, deviceId, brightness);
      } else if ("brightnessDelta" in event.directive.payload) {
        let { brightnessDelta } = event.directive.payload;
        newBrightness = Math.max(0, newBrightness + brightnessDelta);
        await deviceUpdate(userId, deviceId, Math.max(0, newBrightness));
      }
      let ar = new AlexaResponse({
        correlationToken: correlationToken,
        token: userId,
        endpointId: deviceId,
      });
      ar.addContextProperty({
        namespace: "Alexa.PowerController",
        name: "powerState",
        value: Boolean(newBrightness) ? "ON" : "FALSE",
      });
      ar.addContextProperty({
        namespace: "Alexa.BrightnessController",
        name: "brightness",
        value: newBrightness,
      });
      return sendResponse(ar.get());
    } catch (err) {
      return new AlexaResponse({
        name: "ErrorResponse",
        payload: {
          type: "ENDPOINT_UNREACHABLE",
          message: "Unable to reach endpoint database.",
        },
      }).get();
    }
  }

  if (namespace.toLowerCase() == "alexa.percentagecontroller") {
    const { deviceId, userId, correlationToken } = extractUsefulTokens(event);
    try {
      const deviceState = await getDeviceState(userId, deviceId);
      let newPercent = deviceState.value;
      if ("percentage" in event.directive.payload) {
        let { percentage } = event.directive.payload;
        newPercent = percentage;
        await deviceUpdate(userId, deviceId, percentage);
      } else if ("percentageDelta" in event.directive.payload) {
        let { percentageDelta } = event.directive.payload;
        newPercent = Math.max(0, newPercent + percentageDelta);
        await deviceUpdate(userId, deviceId, Math.max(0, newPercent));
      }
      let ar = new AlexaResponse({
        correlationToken: correlationToken,
        token: userId,
        endpointId: deviceId,
      });
      ar.addContextProperty({
        namespace: "Alexa.PowerController",
        name: "powerState",
        value: Boolean(newPercent) ? "ON" : "FALSE",
      });
      ar.addContextProperty({
        namespace: "Alexa.PercentageController",
        name: "percentage",
        value: newPercent,
      });
      return sendResponse(ar.get());
    } catch (err) {
      return new AlexaResponse({
        name: "ErrorResponse",
        payload: {
          type: "ENDPOINT_UNREACHABLE",
          message: "Unable to reach endpoint database.",
        },
      }).get();
    }
  }

  if (namespace.toLowerCase() === "alexa.powercontroller") {
    try {
      let power_state_value = false;
      if (event.directive.header.name === "TurnOn") power_state_value = true;

      const { deviceId, userId, correlationToken } = extractUsefulTokens(event);

      let ar = new AlexaResponse({
        correlationToken: correlationToken,
        token: userId,
        endpointId: deviceId,
      });
      ar.addContextProperty({
        namespace: "Alexa.PowerController",
        name: "powerState",
        value: power_state_value ? "ON" : "FALSE",
      });
      await deviceUpdate(userId, deviceId, Number(power_state_value) * 100);
      return sendResponse(ar.get());
    } catch (err) {
      return new AlexaResponse({
        name: "ErrorResponse",
        payload: {
          type: "ENDPOINT_UNREACHABLE",
          message: "Unable to reach endpoint database.",
        },
      }).get();
    }
  }
};

function sendResponse(response) {
  // TODO Validate the response
  // console.log("index.handler event response -----");
  // console.log(JSON.stringify(response));
  return response;
}
