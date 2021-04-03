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
  return syncResponse;
});

app.onQuery(async (body, headers) => {
  functions.logger.debug('QueryRequest:', body);
  const userId = await getUser(headers);
  // const deviceStates: DeviceStatesMap = {};
  const {devices} = body.inputs[0].payload;
  const devicesIds = devices.map(dev => dev.id);
  const deviceState = await getDeviceState(userId, devicesIds);

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
  const disconnectResponse = {};
  functions.logger.debug('DisconnectResponse:', disconnectResponse);
  return disconnectResponse;
});

export const fulfillment = functions.https.onRequest(app);
