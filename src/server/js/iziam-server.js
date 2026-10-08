import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { iziamOAuth } from 'meteor/pwix:iziam-oauth';

AccountsIziam.configure = options => iziamOAuth.configure(options);

// Only public identity fields may be autopublished, never access/refresh tokens.
Accounts.addAutopublishFields({
    forLoggedInUser: ['services.iziam.id', 'services.iziam.username', 'services.iziam.name',
        'services.iziam.email', 'services.iziam.email_verified', 'services.iziam.picture'],
    forOtherUsers: ['services.iziam.username']
});

async function identity(userId) {
    if (!userId) throw new Meteor.Error('not-authorized');
    const user = await Meteor.users.findOneAsync(userId, { fields: { 'services.iziam': 1 } });
    if (!user?.services?.iziam?.id) throw new Meteor.Error('not-authorized');
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
