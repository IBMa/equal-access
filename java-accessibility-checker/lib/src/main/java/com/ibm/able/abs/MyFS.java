package com.ibm.able.abs;

import com.ibm.able.engine.ACReport;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import com.ibm.able.config.ACConfigManager;
import com.ibm.able.config.ConfigInternal;

public class MyFS implements IAbstractAPI {
    public static Gson gson = new Gson();

    @Override
    public void writeFile(String filePath, Object contents) throws IOException {
        File outFile = this.prepFileSync(filePath);
        FileWriter myWriter = new FileWriter(outFile);
        myWriter.write(contents.toString());
        myWriter.close();
    }

    private File prepFileSync(String filePath) {
        ConfigInternal config = ACConfigManager.getConfigUnsupported();
        Path outFile = Paths.get(System.getProperty("user.dir"), config.outputFolder, filePath);
        File f = outFile.toFile();
        File dir = f.getParentFile();
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return f;
    }

    @Override
    public ACReport loadBaseline(String scanLabel) {
        ConfigInternal config = ACConfigManager.getConfigUnsupported();
        Path outPath = Paths.get(System.getProperty("user.dir"), config.baselineFolder, scanLabel+".json");
        File outFile = outPath.toFile();
        if (!outFile.exists()) return null;
        JsonReader reader;
        try {
            reader = new JsonReader(new FileReader(outFile));
        } catch (FileNotFoundException e) {
            return null;
        }
        return gson.fromJson(reader, ACReport.class);
    }
}
