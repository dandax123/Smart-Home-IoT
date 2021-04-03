import fs from 'fs';
import path from 'path';
import {
  executeDeviceUpdate,
  getDeviceState,
  getUserDevices,
} from './parser/index';
import {
  smarthome,
  SmartHomeV1ExecuteResponseCommands,
  Headers,
} from 'actions-on-google';
import * as functions from 'firebase-functions';

import {getUser} from './routes/auth';
import * as firestore from './firestore';
import {ISyncDevice} from './utils/types';
import {map} from 'p-iteration';

let jwt;
try {
  jwt = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'smart-home-key.json')).toString()
  );
} catch (e) {
  functions.logger.warn('error reading service account key:', e);
  functions.logger.warn('reportState and requestSync operation will fail');
}

export const app = smarthome({
  jwt,
});

// Array could be of any type
async function asyncForEach<T>(array: T[], callback: Function) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function getUserIdOrThrow(headers: Headers): Promise<string> {
  const userId = await getUser(headers);
  if (!userId) {
    throw new Error(
      `User ${userId} has not created an account, so there are no devices`
    );
  }
  return userId;
}

app.onSync(async (body, headers) => {
  const userId = await getUserIdOrThrow(headers);
  const devices: any = await getUserDevices(userId);
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

interface DeviceStatesMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
app.onQuery(async (body, headers) => {
  functions.logger.debug('QueryRequest:', body);
  const userId = await getUser(headers);
  // const deviceStates: DeviceStatesMap = {};
  const {devices} = body.inputs[0].payload;
  const devicesIds = devices.map(dev => dev.id);
  const deviceState = await getDeviceState(userId, devicesIds);
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

app.onExecute(async (body, headers) => {
  functions.logger.debug('ExecuteRequest:', body);
  const userId = await getUserIdOrThrow(headers);
  // const commands:  = [];

  const {devices, execution} = body.inputs[0].payload.commands[0];
  const commands: SmartHomeV1ExecuteResponseCommands[] = await map(
    devices,
    async (device: {id: string}) => {
      const newUpdate = await executeDeviceUpdate(
        userId,
        device.id,
        execution[0]
      );
      return newUpdate;
    }
  );

  const executeResponse = {
    requestId: body.requestId,
    payload: {
      commands,
    },
  };
  functions.logger.debug('ExecuteResponse:', executeResponse);
  return executeResponse;
});

app.onDisconnect(async (body, headers) => {
  functions.logger.debug('DisconnectRequest:', body);
  const userId = await getUserIdOrThrow(headers);
  await firestore.disconnect(userId);
  const disconnectResponse = {};
  functions.logger.debug('DisconnectResponse:', disconnectResponse);
  return disconnectResponse;
});

export const fulfillment = functions.https.onRequest(app);
