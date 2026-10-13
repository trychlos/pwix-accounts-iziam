/*
 * pwix:accounts-iziam/src/client/js/iziam-client.js
 */

import { Accounts } from 'meteor/accounts-base';
import { iziamOAuth } from 'meteor/pwix:iziam-oauth';
import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';

const logger = Logger.get();

import { logoutInPopup } from './logout-popup.js';

AccountsIziam.login = ( options, callback ) => {
    if( typeof options === 'function' ){
        callback = options;
        options = {};
    }
    iziamOAuth.requestCredential( options, Accounts.oauth.credentialRequestCompleteHandler( callback ));
};

Accounts.registerClientLoginFunction( iziamOAuth.C.Service, AccountsIziam.login );

Meteor.loginWithIzIAM = (...args) => Accounts.applyLoginFunction( iziamOAuth.C.Service, args );

AccountsIziam.changePassword = ( options, callback ) => {
    if( typeof options === 'function' ){
        callback = options;
        options = {};
    }
    iziamOAuth.requestCredential( options, Accounts.oauth.credentialRequestCompleteHandler( callback ), 'pwix.accountsIziam.m.changeOptions');
};

// The popup opens synchronously; fetch options before ending the authenticated DDP session.
AccountsIziam.logout = () => {
    return logoutInPopup({
        browser: window,
        confirmLogout: AccountsIziam.configure().confirmLogout === true,
        async getOptions(){
            const result = await Meteor.callAsync( 'pwix.accountsIziam.m.logoutOptions' );
            //logger.debug( 'AccountsIziam.logout()', result );
            return result;
        },
        logoutLocal: () => new Promise(( resolve, reject ) => Meteor.logout( error => error ? reject( error ) : resolve()))
    });
};
