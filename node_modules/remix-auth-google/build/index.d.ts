import type { StrategyVerifyCallback } from 'remix-auth';
import type { OAuth2Profile, OAuth2StrategyVerifyParams } from 'remix-auth-oauth2';
import { OAuth2Strategy } from 'remix-auth-oauth2';
/**
 * @see https://developers.google.com/identity/protocols/oauth2/scopes
 */
export type GoogleScope = string;
export type GoogleStrategyOptions = {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    /**
     * @default "openid profile email"
     */
    scope?: GoogleScope[] | string;
    accessType?: 'online' | 'offline';
    includeGrantedScopes?: boolean;
    prompt?: 'none' | 'consent' | 'select_account';
    hd?: string;
    loginHint?: string;
};
export type GoogleProfile = {
    id: string;
    displayName: string;
    name: {
        familyName: string;
        givenName: string;
    };
    emails: [{
        value: string;
    }];
    photos: [{
        value: string;
    }];
    _json: {
        sub: string;
        name: string;
        given_name: string;
        family_name: string;
        picture: string;
        locale: string;
        email: string;
        email_verified: boolean;
        hd: string;
    };
} & OAuth2Profile;
export type GoogleExtraParams = {
    expires_in: 3920;
    token_type: 'Bearer';
    scope: string;
    id_token: string;
} & Record<string, string | number>;
export declare const GoogleStrategyScopeSeperator = " ";
export declare const GoogleStrategyDefaultScopes: string;
export declare const GoogleStrategyDefaultName = "google";
export declare class GoogleStrategy<User> extends OAuth2Strategy<User, GoogleProfile, GoogleExtraParams> {
    name: string;
    private readonly accessType;
    private readonly prompt?;
    private readonly includeGrantedScopes;
    private readonly hd?;
    private readonly loginHint?;
    private readonly userInfoURL;
    constructor({ clientID, clientSecret, callbackURL, scope, accessType, includeGrantedScopes, prompt, hd, loginHint, }: GoogleStrategyOptions, verify: StrategyVerifyCallback<User, OAuth2StrategyVerifyParams<GoogleProfile, GoogleExtraParams>>);
    protected authorizationParams(): URLSearchParams;
    protected userProfile(accessToken: string): Promise<GoogleProfile>;
    private parseScope;
}
