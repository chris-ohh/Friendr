const GraphQL = require('graphql');
var validator = require('validator');

const auth = require('../../config/auth');
const option = require('../../config/options');
const Generic = require('../types/Generic');


const {
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLID,
    GraphQLList
} = GraphQL;

// lets import our user type
const UserType = require('../types/User');

// lets import our user resolver
const UserResolver = require('../resolvers/User');


module.exports = {

    login() {
        return {
            type: UserType,
            description: 'Add new User',

            args: {
                mobileNumber: {
                    type: new GraphQLNonNull(GraphQLString),
                    description: 'Mobile number cannot be left empty',
                },
                password: {
                    type: new GraphQLNonNull(GraphQLString),
                    description: 'Enter password, will be automatically hashed',
                }
            },
            resolve(parent, fields) {
                return UserResolver.auth(fields);
            }
        }
    },

    create() {
        return {
            type: UserType,
            description: 'Add new User',

            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString),
                    description: 'Enter full name, Cannot be left empty',
                },
                email: {
                    type: new GraphQLNonNull(GraphQLString),
                    description: 'Enter email',
                },
                mobileNumber: {
                    type: new GraphQLNonNull(GraphQLString),
                    description: 'Enter mobile number',
                },
                password: {
                    type: new GraphQLNonNull(GraphQLString),
                    description: 'Enter password, will be automatically hashed',
                }
            },
            resolve(parent, fields) {
                if (!validator.isMobilePhone(fields.mobileNumber, option.mobileNumberLocale)) {
                    throw new Error("Invalid mobile number!");
                }

                if (!validator.isLength(fields.password, {min: option.minPasswordLength, max: undefined})) {
                    throw new Error("Your password should be greater then " + option.minPasswordLength + " characters!");
                }

                return UserResolver.create(fields);
            }
        }
    },


    update() {
        return {
            type: UserType,
            description: 'Update user details',
            args: {
                name: {
                    type: GraphQLString,
                    description: 'Enter full name, Cannot be left empty',
                },
                email: {
                    type: GraphQLString,
                    description: 'Enter email address, Must be valid and unique',
                },
                password: {
                    type: GraphQLString,
                    description: 'Enter password, will be automatically hashed',
                },
                mobileNumber: {
                    type: GraphQLString,
                    description: 'Enter mobile number',
                },
                dob: {
                    type: GraphQLString,
                    description: 'Enter mobile number',
                }
            },
            resolve(parent, fields, context, info) {

                if (auth.isAuthenticated(context)) {

                    if (fields.email && !validator.isEmail(fields.email)) {
                        throw new Error("Invalid email address!");
                    }
                    if (fields.mobileNumber && !validator.isMobilePhone(fields.mobileNumber, option.mobileNumberLocale)) {
                        throw new Error("Invalid mobile number!");
                    }

                    if (fields.password && !validator.isLength(fields.password, {
                            min: option.minPasswordLength,
                            max: undefined
                        })) {
                        throw new Error("Your password should be greater then " + option.minPasswordLength + " characters!");
                    }

                    fields['picture'] = context.picture;

                    return UserResolver.update(context.user, fields);
                }
            }

        }
    },


    fcm() {
        return {
            type: Generic.messageOutputType,
            description: 'Update user Device token',

            args: {
                deviceToken: {
                    type: new GraphQLNonNull(GraphQLString),
                    description: 'Enter device token',
                },
                platform: {
                    type: new GraphQLNonNull(GraphQLString),
                    description: 'Enter platform  android, ios',
                }
            },
            resolve(parent, fields, context, info) {

                if (auth.isAuthenticated(context)) {
                    return UserResolver.updateFcmDeviceToken(context.user, fields);
                }
            }

        }
    }

};
