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
package com.ibm.able.engine;

import org.junit.Test;
import static org.junit.Assert.*;

import com.ibm.able.engine.ACReport;

public class ACReportTest {

    @Test public void cloneTest() {
        ACReport one = new ACReport();
        one.results = new ACReport.Result[1];
        one.results[0] = new ACReport.Result();
        ACReport two = (ACReport) one.clone();
        assertNotSame(one, two);

        two.label="ASDF";
        assertNotEquals(one.label, two.label);

        two.summary.URL="Hi";
        assertNotEquals(one.summary.URL, two.summary.URL);

        two.summary.counts.elements = 5;
        assertNotEquals(one.summary.counts.elements, two.summary.counts.elements);

        assertNotSame(one.results[0], two.results[0]);

        two.results[0].category = "Test";
        assertNotEquals(one.results[0].category, two.results[0].category);

        two.results[0].bounds.top = 5;
        assertNotEquals(one.results[0].bounds.top, two.results[0].bounds.top);
    }
}
