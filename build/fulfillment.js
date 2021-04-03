"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fulfillment = exports.app = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("./parser/index");
const actions_on_google_1 = require("actions-on-google");
const functions = __importStar(require("firebase-functions"));
const auth_1 = require("./routes/auth");
const firestore = __importStar(require("./firestore"));
const p_iteration_1 = require("p-iteration");
let jwt;
try {
    jwt = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, 'smart-home-key.json')).toString());
}
catch (e) {
    functions.logger.warn('error reading service account key:', e);
    functions.logger.warn('reportState and requestSync operation will fail');
}
exports.app = actions_on_google_1.smarthome({
    jwt,
});
// Array could be of any type
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
async function getUserIdOrThrow(headers) {
    const userId = await auth_1.getUser(headers);
    if (!userId) {
        throw new Error(`User ${userId} has not created an account, so there are no devices`);
    }
    return userId;
}
exports.app.onSync(async (body, headers) => {
    const userId = await getUserIdOrThrow(headers);
    const devices = await index_1.getUserDevices(userId);
    functions.logger.error('devices:', devices);
    const syncResponse = {
        requestId: body.requestId,
        payload: {
            agentUserId: userId,
            devices,
        },
    };
    functions.logger.debug('SyncResponse:', syncResponse);
    // try {
    //   functions.logger.error('parser-error:', err);
    // } catch (err) {
    // }
    return syncResponse;
    // await firestore.setHomegraphEnable(userId, true);
    // const devices = [
    //   {
    //     id: '123',
    //     type: 'action.devices.types.OUTLET',
    //     traits: ['action.devices.traits.OnOff'],
    //     name: {
    //       defaultNames: ['My Outlet 1234'],
    //       name: 'Night light',
    //       nicknames: ['wall plug'],
    //     },
    //     willReportState: false,
    //     roomHint: 'kitchen',
    //     deviceInfo: {
    //       manufacturer: 'lights-out-inc',
    //       model: 'hs1234',
    //       hwVersion: '3.2',
    //       swVersion: '11.4',
    //     },
    //     otherDeviceIds: [
    //       {
    //         deviceId: 'local-device-id',
    //       },
    //     ],
    //     customData: {
    //       fooValue: 74,
    //       barValue: true,
    //       bazValue: 'foo',
    //     },
    //   },
    //   {
    //     id: '456',
    //     type: 'action.devices.types.LIGHT',
    //     traits: [
    //       'action.devices.traits.OnOff',
    //       'action.devices.traits.Brightness',
    //       'action.devices.traits.ColorSetting',
    //     ],
    //     name: {
    //       defaultNames: ['lights out inc. bulb A19 color hyperglow'],
    //       name: 'lamp1',
    //       nicknames: ['reading lamp'],
    //     },
    //     willReportState: false,
    //     roomHint: 'office',
    //     attributes: {
    //       colorModel: 'rgb',
    //       colorTemperatureRange: {
    //         temperatureMinK: 2000,
    //         temperatureMaxK: 9000,
    //       },
    //       commandOnlyColorSetting: false,
    //     },
    //     deviceInfo: {
    //       manufacturer: 'lights out inc.',
    //       model: 'hg11',
    //       hwVersion: '1.2',
    //       swVersion: '5.4',
    //     },
    //     customData: {
    //       fooValue: 12,
    //       barValue: false,
    //       bazValue: 'bar',
    //     },
    //   },
    // ];
});
exports.app.onQuery(async (body, headers) => {
    functions.logger.debug('QueryRequest:', body);
    const userId = await auth_1.getUser(headers);
    // const deviceStates: DeviceStatesMap = {};
    const { devices } = body.inputs[0].payload;
    const devicesIds = devices.map(dev => dev.id);
    const deviceState = await index_1.getDeviceState(userId, devicesIds);
    // await asyncForEach(devices, async (device: {id: string}) => {
    //   try {
    //     const states = await firestore.getState(userId, device.id);
    //     deviceStates[device.id] = {
    //       ...states,
    //       status: 'SUCCESS',
    //     };
    //   } catch (e) {
    //     functions.logger.error('error getting device state:', e);
    //     deviceStates[device.id] = {
    //       status: 'ERROR',
    //       errorCode: 'deviceOffline',
    //     };
    //   }
    // });
    const queryResponse = {
        requestId: body.requestId,
        payload: {
            devices: deviceState,
        },
    };
    functions.logger.error('QueryResponse:', queryResponse);
    return queryResponse;
});
exports.app.onExecute(async (body, headers) => {
    functions.logger.debug('ExecuteRequest:', body);
    const userId = await getUserIdOrThrow(headers);
    // const commands:  = [];
    const { devices, execution } = body.inputs[0].payload.commands[0];
    const commands = await p_iteration_1.map(devices, async (device) => {
        const newUpdate = await index_1.executeDeviceUpdate(userId, device.id, execution[0]);
        return newUpdate;
    });
    const executeResponse = {
        requestId: body.requestId,
        payload: {
            commands,
        },
    };
    functions.logger.debug('ExecuteResponse:', executeResponse);
    return executeResponse;
});
exports.app.onDisconnect(async (body, headers) => {
    functions.logger.debug('DisconnectRequest:', body);
    const userId = await getUserIdOrThrow(headers);
    await firestore.disconnect(userId);
    const disconnectResponse = {};
    functions.logger.debug('DisconnectResponse:', disconnectResponse);
    return disconnectResponse;
});
exports.fulfillment = functions.https.onRequest(exports.app);
//# sourceMappingURL=fulfillment.js.map