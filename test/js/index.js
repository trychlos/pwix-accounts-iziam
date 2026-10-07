import { Tinytest } from 'meteor/tinytest';
import { Meteor } from 'meteor/meteor';
import { AccountsIziam } from 'meteor/pwix:accounts-iziam';

Tinytest.add('accounts-iziam - application facade', test => {
    test.equal(typeof AccountsIziam.configure, 'function');
    if (Meteor.isClient) {
        test.equal(typeof Meteor.loginWithIzIAM, 'function');
        test.equal(typeof AccountsIziam.changePassword, 'function');
        test.equal(typeof AccountsIziam.logout, 'function');
        test.equal(AccountsIziam.authorizationFlow, undefined);
    } else {
        test.equal(typeof AccountsIziam.authorizationFlow, 'function');
        test.equal(typeof AccountsIziam.completeAuthorization, 'function');
    }
});
