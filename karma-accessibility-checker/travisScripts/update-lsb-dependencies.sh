#! /bin/bash
# Refer to http://askubuntu.com/questions/758571/google-chrome-stable-depends-on-libstdc6-4-8-0-however-version-of-libs
#

mkdir build
echo "Extracting lastest chrome deb file"
dpkg-deb -x google-chrome-stable_current_amd64.deb build
dpkg-deb --control google-chrome-stable_current_amd64.deb build/DEBIAN
echo "Updating dependencies"
perl -pe  's|lsb-base \(\>\= 4\.1\)|lsb-base \(\>\= 4\.0\)|g' build/DEBIAN/control > build/DEBIAN/control.1
perl -pe  's|libfontconfig1 \(\>\= 2\.9\.0\)|libfontconfig1 \(\>\= 2\.8\.0\)|g' build/DEBIAN/control.1 > build/DEBIAN/control
dpkg -b build google-chrome-stable_current_amd64_lsb4.deb