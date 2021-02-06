#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var filestocopy = [{
    "resources/android-icons-onesignal-transparent/drawable-hdpi/ic_stat_onesignal_default.png":
        "platforms/android/app/src/main/res/drawable-land-hdpi/ic_stat_onesignal_default.png"
}, {
    "resources/android-icons-onesignal-transparent/drawable-mdpi/ic_stat_onesignal_default.png":
        "platforms/android/app/src/main/res/drawable-land-mdpi/ic_stat_onesignal_default.png"
}, {
    "resources/android-icons-onesignal-transparent/drawable-xhdpi/ic_stat_onesignal_default.png":
        "platforms/android/app/src/main/res/drawable-land-xhdpi/ic_stat_onesignal_default.png"
}, {
    "resources/android-icons-onesignal-transparent/drawable-xxhdpi/ic_stat_onesignal_default.png":
        "platforms/android/app/src/main/res/drawable-land-xxhdpi/ic_stat_onesignal_default.png"
}, {
    "resources/android-icons-onesignal-transparent/drawable-xxxhdpi/ic_stat_onesignal_default.png":
        "platforms/android/app/src/main/res/drawable-land-xxxhdpi/ic_stat_onesignal_default.png"
}, {
    "resources/android-icons-onesignal-transparent/drawable-hdpi/ic_stat_onesignal_default.png":
        "platforms/android/app/src/main/res/drawable-port-hdpi/ic_stat_onesignal_default.png"
}, {
    "resources/android-icons-onesignal-transparent/drawable-mdpi/ic_stat_onesignal_default.png":
        "platforms/android/app/src/main/res/drawable-port-mdpi/ic_stat_onesignal_default.png"
}, {
    "resources/android-icons-onesignal-transparent/drawable-xhdpi/ic_stat_onesignal_default.png":
        "platforms/android/app/src/main/res/drawable-port-xhdpi/ic_stat_onesignal_default.png"
}, {
    "resources/android-icons-onesignal-transparent/drawable-xxhdpi/ic_stat_onesignal_default.png":
        "platforms/android/app/src/main/res/drawable-port-xxhdpi/ic_stat_onesignal_default.png"
}, {
    "resources/android-icons-onesignal-transparent/drawable-xxxhdpi/ic_stat_onesignal_default.png":
        "platforms/android/app/src/main/res/drawable-port-xxxhdpi/ic_stat_onesignal_default.png"
} ];

module.exports = function(context) {

    // no need to configure below
    var rootdir = context.opts.projectRoot;

    filestocopy.forEach(function(obj) {
        Object.keys(obj).forEach(function(key) {
            var val = obj[key];
            var srcfile = path.join(rootdir, key);
            var destfile = path.join(rootdir, val);
            console.log("copying "+srcfile+" to "+destfile);
            var destdir = path.dirname(destfile);
            if (fs.existsSync(srcfile) && fs.existsSync(destdir)) {
                fs.createReadStream(srcfile).pipe(
                    fs.createWriteStream(destfile));
            }
        });
    });

};