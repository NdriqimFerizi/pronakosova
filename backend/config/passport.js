const passport = require('passport');
const { Strategy: Local } = require('passport-local');
const { Strategy: Google } = require('passport-google-oauth20');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
passport.use(new Local({ usernameField:'email' }, async (email, password, done) => {
  try {
    const u = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!u) return done(null, false, { message: 'Kredenciale të gabuara.' });
    if (!u.password) return done(null, false, { message: 'Hyni me Google.' });
    return (await bcrypt.compare(password, u.password)) ? done(null, u) : done(null, false, { message: 'Kredenciale të gabuara.' });
  } catch(e) { return done(e); }
}));
if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(new Google({ clientID: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, callbackURL: process.env.GOOGLE_CALLBACK_URL, proxy: true },
    async (at, rt, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();
        let u = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
        if (!u) u = await User.create({ googleId: profile.id, name: profile.displayName, email, avatar: profile.photos[0]?.value||'', accountType:'buyer', isVerified:true });
        else if (!u.googleId) { u.googleId = profile.id; await u.save(); }
        return done(null, u);
      } catch(e) { return done(e); }
    }));
}
passport.serializeUser((u, done) => done(null, u.id));
passport.deserializeUser(async (id, done) => { try { done(null, await User.findById(id)); } catch(e) { done(e); } });
module.exports = passport;
