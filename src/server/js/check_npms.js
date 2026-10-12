/*
 * pwix:accounts-iziam/src/server/js/check_npms.js
 */

import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

// whitelist packages which are not well handled by the standard ESM import
//  by requiring directly the package.json
if( false ){
    //require( 'multiple-select-vanilla/package.json' );
}

checkNpmVersions({
    'lodash': '^4.17.0'
},
    'pwix:iziam-oauth'
);
