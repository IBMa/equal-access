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
package com.ibm.able.equalaccess.abs;

import com.ibm.able.equalaccess.engine.ACReport;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import com.ibm.able.equalaccess.config.ACConfigManager;
import com.ibm.able.equalaccess.config.ConfigInternal;

public class MyFS implements IAbstractAPI {
    public static Gson gson = new Gson();

    @Override
    public void writeFile(String filePath, Object contents) throws IOException {
        File outFile = this.prepFile(filePath);
        FileWriter myWriter = new FileWriter(outFile);
        myWriter.write(contents.toString());
        myWriter.close();
    }

    @Override
    public File prepFile(String filePath) {
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
