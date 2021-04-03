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
  console.log('provide the smart key');
}

export const app = smarthome({
  jwt,
});

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
  const userId = await getUser(headers);
  const {devices} = body.inputs[0].payload;
  const devicesIds = devices.map(dev => dev.id);
  const deviceState = await getDeviceState(userId, devicesIds);

  const queryResponse = {
    requestId: body.requestId,
    payload: {
      devices: deviceState,
    },
  };
  return queryResponse;
});

app.onExecute(async (body, headers) => {
  const userId = await getUserIdOrThrow(headers);

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
  return executeResponse;
});

app.onDisconnect(async (body, headers) => {
  const userId = await getUserIdOrThrow(headers);
  const disconnectResponse = {};
  return disconnectResponse;
});

export const fulfillment = functions.https.onRequest(app);
