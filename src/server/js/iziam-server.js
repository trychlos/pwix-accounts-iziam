/*
 * pwix:accounts-iziam/src/server/js/iziam-server.js
 */

import { Accounts } from 'meteor/accounts-base';
import { AccountsCore } from 'meteor/pwix:accounts-core';
import { check } from 'meteor/check';
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

async function identity( userId ){
    logger.debug( 'identity() userId='+userId );
    if( !userId ){
        // either a code error or an attack attempt - just answer with a banal error
        throw new Meteor.Error( 'not-authorized' );
    }
    const user = await Meteor.users.findOneAsync( userId, { fields: { 'services.iziam': 1 }});
    logger.debug( 'identity() user', user );
    if( !user?.services?.iziam?.id ){
        throw new Meteor.Error( 'not-authorized' );
    }
    return user.services.iziam;
}

Meteor.methods({
    async 'pwix.accountsIziam.changeOptions'(options = {}) {
        check(options, Object);
        const service = await identity(this.userId);
        return iziamOAuth.s.loginOptions(options, {
            purpose: 'change_password', expectedSubject: service.id
        });
    },
    async 'pwix.accountsIziam.logoutOptions'() {
        const service = await identity(this.userId);
        return iziamOAuth.s.logoutOptions(service);
    }
});

// Application-facing server APIs. Applications own token storage and any
// authorization policy; these are intentionally not anonymous DDP methods.
AccountsIziam.authorizationFlow = ( grantType, options ) => iziamOAuth.authorizationFlow( grantType, options );

AccountsIziam.completeAuthorization = ( query, credentialToken ) => iziamOAuth.completeAuthorization( query, credentialToken );

// when a new user arrives, set a hook to create a 'user' document compatible with Meteor expectations

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
