/*
 * pwix:accounts-iziam/src/client/components/iziamChangeButton/iziamChangeButton.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';

import './iziamChangeButton.html';

Template.iziamChangeButton.helpers({
    // classes to be added to the button
    btnClass(){
        return this.btnClasses || 'btn-outline-primary';
    },

    // button label
    btnLabel(){
        return this.btnLabel || pwixI18n.label( I18N, 'change.button.label' );
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    }
});

Template.iziamChangeButton.events({
    'click .iziamChangeButton button'(event, instance) {
        AccountsIziam.changePassword({}, error => {
            // Applications may display their own notification through onComplete.
            if (typeof instance.data?.onComplete === 'function') instance.data.onComplete(error);
            else if (error) console.error('izIAM password change failed', error.reason || error.message);
        });
    }
});
