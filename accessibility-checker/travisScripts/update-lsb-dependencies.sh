#! /bin/bash
# Refer to http://askubuntu.com/questions/758571/google-chrome-stable-depends-on-libstdc6-4-8-0-however-version-of-libs
#
#******************************************************************************
#     Copyright:: 2020- IBM, Inc

#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at

#    http://www.apache.org/licenses/LICENSE-2.0

#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.
#  *****************************************************************************/

mkdir build
echo "Extracting lastest chrome deb file"
dpkg-deb -x google-chrome-stable_current_amd64.deb build
dpkg-deb --control google-chrome-stable_current_amd64.deb build/DEBIAN
echo "Updating dependencies"
perl -pe  's|lsb-base \(\>\= 4\.1\)|lsb-base \(\>\= 4\.0\)|g' build/DEBIAN/control > build/DEBIAN/control.1
perl -pe  's|libfontconfig1 \(\>\= 2\.9\.0\)|libfontconfig1 \(\>\= 2\.8\.0\)|g' build/DEBIAN/control.1 > build/DEBIAN/control
dpkg -b build google-chrome-stable_current_amd64_lsb4.deb
