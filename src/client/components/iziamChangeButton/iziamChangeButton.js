/*
 * pwix:accounts-iziam/src/client/components/iziamChangeButton/iziamChangeButton.js
 */

import { OAuth } from 'meteor/oauth';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Tolert } from 'meteor/pwix:tolert';

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
    async 'click .iziamChangeButton button'( event, instance ){
        // we expect to receive a new access_token after successful password change
        const prevToken = await Meteor.callAsync( 'pwix.iziamOIDC.m.accessToken' );
        Meteor.callAsync( 'pwix.iziamOIDC.m.changeOptions' ).then(( res ) => {
            OAuth.showPopup( res.url, () => {
                // end of interaction
                //  wait for a new access token
                //  when received, we can display a successful toaster
                // doesn't wait more than 3 sec.
                const length = 3000;
                const start = Date.now();
                const interval = Meteor.setInterval( async () => {
                    const token = await Meteor.callAsync( 'pwix.iziamOIDC.m.accessToken' );
                    let now = Date.now();
                    if( token !== prevToken ){
                        Tolert.success( pwixI18n.label( I18N, 'change.success' ));
                        now = start + 2*length;
                    }
                    if( now - start > length ){
                        Meteor.clearInterval( interval );
                    }
                }, 100);
            }, { width: 800, height: 500 });
        });
    }
});
