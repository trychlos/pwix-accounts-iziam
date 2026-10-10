/*
 * pwix:accounts-iziam/src/client/js/iziam-client.js
 */

import { Accounts } from 'meteor/accounts-base';
import { logoutInPopup } from './logout-popup.js';
import { iziamOAuth } from 'meteor/pwix:iziam-oauth';
import { Meteor } from 'meteor/meteor';

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
    iziamOAuth.requestCredential( options, Accounts.oauth.credentialRequestCompleteHandler( callback ), 'pwix.accountsIziam.changeOptions');
};

// The popup opens synchronously; fetch options before ending the authenticated DDP session.
AccountsIziam.logout = () => logoutInPopup({
    browser: window,
    async getOptions(){
        const result = await Meteor.callAsync( 'pwix.accountsIziam.logoutOptions' );
        return result;
    },
    logoutLocal: () => new Promise(( resolve, reject ) => Meteor.logout( error => error ? reject( error ) : resolve()))
});
