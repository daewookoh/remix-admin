"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleStrategy = exports.GoogleStrategyDefaultName = exports.GoogleStrategyDefaultScopes = exports.GoogleStrategyScopeSeperator = void 0;
const remix_auth_oauth2_1 = require("remix-auth-oauth2");
exports.GoogleStrategyScopeSeperator = ' ';
exports.GoogleStrategyDefaultScopes = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
].join(exports.GoogleStrategyScopeSeperator);
exports.GoogleStrategyDefaultName = 'google';
class GoogleStrategy extends remix_auth_oauth2_1.OAuth2Strategy {
    constructor({ clientID, clientSecret, callbackURL, scope, accessType, includeGrantedScopes, prompt, hd, loginHint, }, verify) {
        super({
            clientID,
            clientSecret,
            callbackURL,
            authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenURL: 'https://oauth2.googleapis.com/token',
        }, verify);
        this.name = exports.GoogleStrategyDefaultName;
        this.userInfoURL = 'https://www.googleapis.com/oauth2/v3/userinfo';
        this.scope = this.parseScope(scope);
        this.accessType = accessType !== null && accessType !== void 0 ? accessType : 'online';
        this.includeGrantedScopes = includeGrantedScopes !== null && includeGrantedScopes !== void 0 ? includeGrantedScopes : false;
        this.prompt = prompt;
        this.hd = hd;
        this.loginHint = loginHint;
    }
    authorizationParams() {
        const params = new URLSearchParams({
            access_type: this.accessType,
            include_granted_scopes: String(this.includeGrantedScopes),
        });
        if (this.prompt) {
            params.set('prompt', this.prompt);
        }
        if (this.hd) {
            params.set('hd', this.hd);
        }
        if (this.loginHint) {
            params.set('login_hint', this.loginHint);
        }
        return params;
    }
    async userProfile(accessToken) {
        const response = await fetch(this.userInfoURL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const raw = await response.json();
        const profile = {
            provider: 'google',
            id: raw.sub,
            displayName: raw.name,
            name: {
                familyName: raw.family_name,
                givenName: raw.given_name,
            },
            emails: [{ value: raw.email }],
            photos: [{ value: raw.picture }],
            _json: raw,
        };
        return profile;
    }
    // Allow users the option to pass a scope string, or typed array
    parseScope(scope) {
        if (!scope) {
            return exports.GoogleStrategyDefaultScopes;
        }
        else if (Array.isArray(scope)) {
            return scope.join(exports.GoogleStrategyScopeSeperator);
        }
        return scope;
    }
}
exports.GoogleStrategy = GoogleStrategy;
