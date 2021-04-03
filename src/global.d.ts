import {PassportUser} from './utils/types';

declare module 'express' {
  export interface Request {
    user: PassportUser;
  }
}
