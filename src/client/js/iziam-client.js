/*
 * pwix:accounts-iziam/src/client/js/iziam-client.js
 *
 * See https://docs.meteor.com/api/accounts#Meteor-loginWith%3CExternalService%3E
 */

import { Accounts } from 'meteor/accounts-base';
import { iziamOIDC } from 'meteor/pwix:iziam-oidc';

const loginWithIzIAM = ( options, callback ) => {

    // support a callback without options
    if( !callback && typeof options === 'function' ){
        callback = options;
        options = null;
    }

    const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler( callback );
    iziamOIDC.requestCredential( options, credentialRequestCompleteCallback );
};

Accounts.registerClientLoginFunction( iziamOIDC.C.Service, loginWithIzIAM );

Meteor.loginWithIzIAM = ( ...args ) => Accounts.applyLoginFunction( iziamOIDC.C.Service, args );
