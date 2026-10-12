/*
 * pwix:iziam-oauth/src/server/js/methods.js
 */

import { check } from 'meteor/check';
import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

async function identity( userId ){
    //logger.debug( 'identity() userId='+userId );
    if( !userId ){
        // either a code error or an attack attempt - just answer with a banal error
        throw new Meteor.Error( 'not-authorized-id' );
    }
    const user = await Meteor.users.findOneAsync( userId, { fields: { 'services.iziam': 1 }});
    //logger.debug( 'identity() user', user );
    if( !user?.services?.iziam?.id ){
        throw new Meteor.Error( 'not-authorized-identity' );
    }
    return user.services.iziam;
}

Meteor.methods({
    async 'pwix.accountsIziam.m.changeOptions'(options = {}) {
        check(options, Object);
        const service = await identity( this.userId );
        return iziamOAuth.s.loginOptions( options, {
            purpose: 'change_password',
            expectedSubject: service.id
        });
    },
    async 'pwix.accountsIziam.m.logoutOptions'() {
        const service = await identity( this.userId );
        return iziamOAuth.s.logoutOptions( service );
    }
});
