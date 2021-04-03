"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = void 0;
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(null);
    }
    return res.redirect('/authProvider/auth/google');
};
exports.ensureAuthenticated = ensureAuthenticated;
const ACCESS_TOKEN_SECRET = 'smart-spider';
//# sourceMappingURL=auth-utils.js.map