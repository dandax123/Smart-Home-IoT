"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstantParseServerUserUrl = exports.ConstantParseServerDeviceUrl = exports.ConstantParseServerLoginUrl = exports.ParseServerUrl = exports.ApplicationId = exports.ConstParseSessionToken = exports.ConstInstallationId = exports.ConstRevocableSession = exports.ConstRestApiKey = exports.ConstApplicationId = void 0;
const dotenv_1 = require("dotenv");
dotenv_1.config();
exports.ConstApplicationId = 'X-Parse-Application-Id';
exports.ConstRestApiKey = 'X-Parse-REST-API-Key';
exports.ConstRevocableSession = 'X-Parse-Revocable-Session';
exports.ConstInstallationId = 'X-Parse-Installation-Id';
exports.ConstParseSessionToken = 'X-Parse-Session-Token';
exports.ApplicationId = process.env.PARSE_SERVER_APPLICATION_ID;
exports.ParseServerUrl = process.env.PARSE_SERVER_URL;
exports.ConstantParseServerLoginUrl = exports.ParseServerUrl + '/login';
exports.ConstantParseServerDeviceUrl = exports.ParseServerUrl + '/classes/Devices';
exports.ConstantParseServerUserUrl = exports.ParseServerUrl + '/classes/Users';
//# sourceMappingURL=index.js.map