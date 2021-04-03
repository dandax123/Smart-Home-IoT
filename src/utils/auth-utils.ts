import jwt from 'jsonwebtoken';
export const ensureAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next(null);
  }
  return res.redirect('/authProvider/auth/google');
};
const ACCESS_TOKEN_SECRET = 'smart-spider';
