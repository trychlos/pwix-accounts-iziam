/*
 * pwix:accounts-iziam/src/common/js/register.js
 */

import { Accounts } from 'meteor/accounts-base';
import { iziamOIDC } from 'meteor/pwix:iziam-oidc';

Accounts.oauth.registerService( iziamOIDC.C.Service );
