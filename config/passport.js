const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/UserModel');

// step 3
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: false
}, async (email, password, done) => {
    try {
        // 1) Check if the email already exists
        const user = await User.findOne({ 'email': email }, '+password');
        if (!user) {
            return done(null, false, 'invalid email or password inputted');
        }

        // 2) Check if the password is correct
        const isValid = await bcrypt.compare(
            password,
            user.password
        );
        if (!isValid) {
            return done(null, false, 'invalid email or Password not correct');
        }


        // 3) Check if email has been verified
        if (!user.is_active) {
            return done(null, false, 'Sorry, you must validate email first');
        }
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));