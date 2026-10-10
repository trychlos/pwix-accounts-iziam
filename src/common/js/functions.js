/*
 * pwix:accounts-iziam/src/common/js/functions.js
 */

import _ from 'lodash';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { iziamOAuth } from 'meteor/pwix:iziam-oauth';
import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

/**
 * @locus Anywhere
 * @returns {Boolean} whether the currently connected user has been authenticated by izIAM Identity and Access Manager
 */
AccountsIziam.isIziamUser = async function(){
    let user;
    if( user ){
        let userDoc = user;
        if( _.isString( user )){
            const acInstance = AccountsCore.getInstance( 'users' );
            if( !acInstance || !( acInstance instanceof AccountsCore.Account )){
                logger.warning( 'unable to get the \'users\' instance' );
                return false;
            }
            userDoc = await acInstance.byAnyIdentifier( user );
            if( !userDoc || !userDoc._id ){
                logger.warning( 'unable to get a user document for \''+user+'\'' );
                return false;
            }
        }
        const isIziam = Boolean( userDoc && userDoc.services && userDoc.services.includes( iziamOAuth.C.Service ));
        return isIziam;
    }
    return false;
}
