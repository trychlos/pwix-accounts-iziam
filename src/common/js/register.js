/*
 * pwix:accounts-iziam/src/common/js/register.js
 */

import { Accounts } from 'meteor/accounts-base';
import { iziamOAuth } from 'meteor/pwix:iziam-oauth';

Accounts.oauth.registerService( iziamOAuth.C.Service );
