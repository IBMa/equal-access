package com.ibm.able.report;

import com.ibm.able.engine.ACReport;

public class ReporterStored {
    public String pageTitle;
    public String scanProfile;
    public ACReport engineReport;

    public ReporterStored(String title, String profile, ACReport report) {
        pageTitle = title;
        scanProfile = profile;
        engineReport = report;
    }
};