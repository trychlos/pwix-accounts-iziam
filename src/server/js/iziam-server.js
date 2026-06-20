/*
 * pwix:accounts-iziam/src/common/js/iziam-server.js
 *
 * See https://docs.meteor.com/api/accounts#Meteor-loginWith%3CExternalService%3E
 */

import { Accounts } from 'meteor/accounts-base';
import { iziamOIDC } from 'meteor/pwix:iziam-oidc';

Accounts.oauth.registerService( iziamOIDC.C.Service );

Accounts.addAutopublishFields({
    forLoggedInUser: [ 'services.'+iziamOIDC.C.Service ],
    forOtherUsers: [ 'services.'+iziamOIDC.C.Service+'.username' ]
});
