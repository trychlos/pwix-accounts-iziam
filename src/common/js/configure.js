/*
 * pwix:accounts-iziam/src/common/js/configure.js
 */

import _ from 'lodash';

import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

const logger = Logger.get();

let _conf = {};
AccountsIziam._conf = new ReactiveVar( _conf );

AccountsIziam._defaults = {
    changeLabel: pwixI18n.label( I18N, 'change.button.label' ),
    changeLogo: '/packages/pwix_accounts-iziam/resources/svg/iziam.svg',
    changeTitle: pwixI18n.label( I18N, 'login.button.title' ),
    confirmLogout: false,
    loginLabel: pwixI18n.label( I18N, 'login.button.label' ),
    loginLogo: '/packages/pwix_accounts-iziam/resources/svg/iziam.svg',
    loginTitle: pwixI18n.label( I18N, 'login.button.title' ),
    verbosity: AccountsIziam.C.Verbose.CONFIGURE
};

/**
 * @summary Get/set the package configuration
 *  Should be called *in same terms* both by the client and the server.
 * @param {Object} o configuration options
 * @returns {Object} the package configuration
 */
AccountsIziam.configure = function( o ){
    if( o && _.isObject( o )){
        // check that keys exist
        let built_conf = {};
        Object.keys( o ).forEach(( it ) => {
            if( Object.keys( AccountsIziam._defaults ).includes( it )){
                built_conf[it] = o[it];
            } else {
                logger.warn( 'configure() ignore unmanaged key \''+it+'\'' );
            }
        });
        if( Object.keys( built_conf ).length ){
            _conf = _.merge( AccountsIziam._defaults, _conf, built_conf );
            AccountsIziam._conf.set( _conf );
            logger.verbose({ verbosity: _conf.verbosity, against: AccountsIziam.C.Verbose.CONFIGURE }, 'configure() with', built_conf );
        }
    }
    // also acts as a getter
    return AccountsIziam._conf.get();
}

_conf = _.merge( {}, AccountsIziam._defaults );
AccountsIziam._conf.set( _conf );
