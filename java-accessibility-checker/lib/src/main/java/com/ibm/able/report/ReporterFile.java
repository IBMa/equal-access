package com.ibm.able.report;

public class ReporterFile {
    public String path;
    // summary: string | Buffer | ((filename?: string) => Promise<void>)
    public Object contents;

    public ReporterFile(String path, String contents) {
        this.path = path;
        this.contents = contents;
    }
}