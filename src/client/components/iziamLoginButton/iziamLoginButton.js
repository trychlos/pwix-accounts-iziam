/*
 * pwix:accounts-iziam/src/client/components/iziamLoginButton/iziamLoginButton.js
 */

import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';

import './iziamLoginButton.html';

const logger = Logger.get();

Template.iziamLoginButton.helpers({
    // classes to be added to the button
    btnClass(){
        return this.btnClasses || 'btn-outline-primary';
    },

    // button label
    btnLabel(){
        return this.btnLabel || pwixI18n.label( I18N, 'login.button.label' );
    },

    // whether we want display a label in the button ?
    haveLabel(){
        return this.withLabel !== false;
    },

    // whether we want display the izIAM logo in the button ?
    haveLogo(){
        return this.withLogo !== false;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    }
});

Template.iziamLoginButton.events({
    'click .iziamLoginButton button'( event, instance ){
        Meteor.loginWithIzIAM( this.iziamOptions || {}, ( err ) => {
            // either an error or undefined - no other result
            if( err ){
                logger.error( 'loginWithIzIAM() callback', err );
            }
        });
    }
});
