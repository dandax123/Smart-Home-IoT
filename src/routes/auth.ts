import express from 'express';
import * as functions from 'firebase-functions';
import {Headers} from 'actions-on-google';
import querystring from 'query-string';
const router = express.Router();

import util from 'util';
import {loginUser} from '../parser';

const formatCode = (redirect_uri: string, state: string): string => {
  const code = util.format(
    '%s?code=%s&state=%s',
    decodeURIComponent(redirect_uri as string),
    'xxxxxx',
    state
  );
  return code ? code : '';
};
router.all('/google', (req, res, next) => {
  const responseUrl = req.query.state;
  res.render('auth/login', {redirectUrl: `${responseUrl}`});
});

// router.get('/login', ensureAuthenticated, (req: any, res: any) => {
//   res.render('auth/login');
// });

router.post('/login', async (req: any, res: any) => {
  // Here, you should validate the user account.
  // In this sample, we do not do that.
  const projectId = 'smart-spider-308904';
  const {username, password, response_url} = req.body;
  const redirect = querystring.parse(response_url as string);
  let userInfo;
  try {
    const user = await loginUser(username, password);
    // functions.logger.error(user);
    if (user) {
      return res.redirect(
        `https://oauth-redirect.googleusercontent.com/r/${projectId}?code=${user.sessionToken}&state=${response_url}`
      );
    }
  } catch (err) {
    // functions.logger.error('/parse-server err', err);
    res.render('auth/login', {
      redirectUrl: response_url,
      error: 'invalid login',
    });
  }
});

router.post('/token', async (req, res) => {
  const grantType = req.body.grant_type;
  const code = req.body.code;
  const secondsInDay = 60 * 60 * 60 * 1; // 60 * 60 * 24
  const HTTP_STATUS_OK = 200;
  let token;
  // functions.logger.error('/verified-code', code);
  if (code.length !== 34) {
    return res.status(400).json({error: 'invalid_grant'});
  }
  if (grantType === 'refresh_token') {
    token = {
      token_type: 'Bearer',
      access_token: `${code}`,
      expires_in: secondsInDay,
    };
  } else {
    token = {
      token_type: 'Bearer',
      access_token: `${code}`,
      refresh_token: `${code}`,
      expires_in: secondsInDay,
    };
  }
  return res.status(HTTP_STATUS_OK).json(token);
});
//returns the session id for parse server
export function getUser(headers: Headers): string {
  // functions.logger.debug('/headers', headers);
  const authorization = headers.authorization;
  // functions.logger.debug('/headers-authorization', authorization);
  // functions.logger.debug('authorization:', authorization);
  const accessToken = (authorization as string).substr(7);
  return accessToken;
}
export default router;
