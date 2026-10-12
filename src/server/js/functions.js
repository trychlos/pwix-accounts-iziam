/*
 * pwix:accounts-iziam/src/server/js/functions.js
 */

import { Accounts } from 'meteor/accounts-base';
import { AccountsCore } from 'meteor/pwix:accounts-core';
import { iziamOAuth } from 'meteor/pwix:iziam-oauth';
import { Logger } from 'meteor/pwix:logger';
import { Random } from 'meteor/random';

const logger = Logger.get();

// Only public identity fields may be autopublished, never access/refresh tokens.
Accounts.addAutopublishFields({
    forLoggedInUser: [
        'services.iziam.id',        // 'id' here is the identity identifier in izIAM
        'services.iziam.email',
        'services.iziam.email_verified',
        'services.iziam.name',
        'services.iziam.picture',
        'services.iziam.username'
    ],
    forOtherUsers: [
        'services.iziam.username'
    ]
});

// Application-facing server APIs. Applications own token storage and any
// authorization policy; these are intentionally not anonymous DDP methods.
AccountsIziam.authorizationFlow = ( grantType, options ) => iziamOAuth.authorizationFlow( grantType, options );

AccountsIziam.completeAuthorization = ( query, credentialToken ) => iziamOAuth.completeAuthorization( query, credentialToken );

// set a hook to create a 'user' document compatible with Meteor expectations when a new user arrives

AccountsCore.onCreateUser(( opts, user ) => {
    logger.debug( 'AccountsIziam.onCreateUser()', user );
    if( AccountsIziam.isIziamUser( user )){
        if( user.emails ){
            throw new Error( 'user has already an emails structure which is un expected' );
        }
        logger.debug( 'AccountsIziam.onCreateUser() adding emails array' );
        user.emails = [
            {
                _id: Random.id(),
                address: user.services.iziam.email,
                verified: user.services.iziam.email_verified,
            }
        ];
    }
    return user;
});
