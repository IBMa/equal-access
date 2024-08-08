/******************************************************************************
    Copyright:: 2024- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 *****************************************************************************/
package com.ibm.able.util;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class Misc {
    private Misc() {}

    public static <T> T firstNotNull(T ... args) {
        for (T x : args) {
            if (x != null) return x;
        }
        return null;
    }
    
    public static boolean classIsAvailable(String className) {
        try {
            Class.forName(className);
            return true;
        } catch (Throwable ex) {
            // Class or one of its dependencies is not present...
            return false;
        }
    }

    public static String toISOString(Date d) {
        TimeZone tz = TimeZone.getTimeZone("UTC");
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
        df.setTimeZone(tz);
        return df.format(d);        
    }
}
