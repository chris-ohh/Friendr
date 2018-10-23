var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var _ = require('lodash');
var mongoosePaginate = require('mongoose-paginate');

var profileSchema = new mongoose.Schema({
  // more fields
    description: String,
});

var userSchema = new mongoose.Schema({
    email: {type: String, default: ''},
    isEmailVerified: Boolean,

    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    name: {type: String, default: ''},
    gender: {type: String, default: ''},
    birthday: {type: Date},
    picture: {type: String, default: ''},

    status: {type: String, default: "active"},

    profile: [profileSchema],
    friends: [{type: Schema.Types.ObjectId, ref: 'User'}],
    blocked: [{type: Schema.Types.ObjectId, ref: 'User'}],

}, {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

userSchema.plugin(mongoosePaginate);

var User = mongoose.model('User', userSchema);


module.exports = User;
