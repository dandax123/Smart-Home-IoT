import {config} from 'dotenv';
config();
import express from 'express';
import {Headers} from 'actions-on-google';
const router = express.Router();
import {loginUser} from '../parser';

router.all('/google', (req, res, _) => {
  const responseUrl = req.query.state;
  res.render('auth/login', {redirectUrl: `${responseUrl}`});
});

router.post('/login', async (req: any, res: any) => {
  const projectId = process.env.PROJECT_ID as string;
  const {username, password, response_url} = req.body;
  try {
    const user = await loginUser(username, password);
    if (user) {
      return res.redirect(
        `https://oauth-redirect.googleusercontent.com/r/${projectId}?code=${user.sessionToken}&state=${response_url}`
      );
    }
  } catch (err) {
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
export function getUser(headers: Headers): string {
  const authorization = headers.authorization;
  const accessToken = (authorization as string).substr(7);
  return accessToken;
}
export default router;
