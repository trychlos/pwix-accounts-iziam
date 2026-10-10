/*
 * pwix:accounts-iziam/src/client/js/functions.js
 */

import _ from 'lodash';

import { Logger } from 'meteor/pwix:logger';
import { Tracker } from 'meteor/tracker';

const logger = Logger.get();

Meteor.startup(() => {
    Tracker.autorun(() => {
        // set a hook on dropdown menu items
        // when unlogged, then add our login item
        if( Package['pwix:accounts-ui'] && Package['pwix:accounts-ui'].AccountsUI.ready()){
            const AccountsUI = Package['pwix:accounts-ui'].AccountsUI;

            // whether the dropdown menu items already have a divider
            const _hasDivider = function( items ){
                for( const it of items ){
                    if( it.match( 'dropdown-divider' )){
                        return true;
                    }
                }
                return false;
            };

            // install a menu items hook
            AccountsUI.onRebuildMenuItems( async ( items, opts ) => {
                //console.debug( 'onRebuildMenuItems state', AccountsUI, items, opts, 'state', AccountsUI.Connection.state());
                const connection = AccountsUI.Connection;
                switch( connection.state()){
                    case AccountsUI.C.Connection.LOGGED:
                        // nothing to do here
                        break;

                    // when unlogged, have login with iziam
                    case AccountsUI.C.Connection.UNLOGGED:
                        let label = AccountsIziam.configure().loginLabel;
                        if( _.isFunction( label )){
                            label = label();
                        }
                        let logo = AccountsIziam.configure().loginLogo;
                        if( _.isFunction( logo )){
                            logo = logo();
                        }
                        if( !_hasDivider( items )){
                            items.push( '<hr class="dropdown-divider">' );
                        }
                        items.push( '<a class="dropdown-item d-flex align-items-center justify-content-start ac-dropdown-item" href="#" data-ac-event="ac-iziam-signin"><img class="ac-iziam-img" src="'+logo+'" /><p>'+label+'</p></a>' );
                        break;
                }

                // returns the new items
                return items;
            });

            // install events handlers
            $( document ).on( 'ac-iziam-signin', '.acUserLogin', function( event, data ){
                AccountsIziam.login(( error ) => {
                    if( error ){
                        logger.log( error );
                    }
                });
            });
            $( document ).on( 'ac-panel-changepwd-event', '.acUserLogin', function( event, data ){
                if( AccountsIziam.isIziamUser()){

                }
            });
            $( document ).on( 'ac-panel-signout-event', '.acUserLogin', function( event, data ){
                if( AccountsIziam.isIziamUser()){

                }
            });
        }
    });
});
