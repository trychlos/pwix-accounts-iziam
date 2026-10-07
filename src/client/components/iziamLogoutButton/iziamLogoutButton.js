/*
 * pwix:accounts-iziam/src/client/components/iziamLogoutButton/iziamLogoutButton.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';

import './iziamLogoutButton.html';

Template.iziamLogoutButton.helpers({
    // classes to be added to the button
    btnClass(){
        return this.btnClasses || 'btn-outline-primary';
    },

    // button label
    btnLabel(){
        return this.btnLabel || pwixI18n.label( I18N, 'logout.button.label' );
    },

    // whether we want display a label in the button ?
    haveLabel(){
        return this.withLabel !== false;
    },

    // whether we want display the izIAM logo in the button ?
    haveLogo(){
        return this.withLogo === true;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    }
});

Template.iziamLogoutButton.events({
    'click .iziamLogoutButton button'( event, instance ){
        AccountsIziam.logout().catch(error => console.error('izIAM logout failed', error.reason || error.message));
    }
});
