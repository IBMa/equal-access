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

package com.ibm.able.config;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import com.ibm.able.config.Archive;
import com.ibm.able.util.Fetch;
import com.ibm.able.util.Misc;

public class ACConfigManager {
    private static class ConfigError extends Error {
        ConfigError(String message) {
            super(message);
        }

    }

    private static String[] covertPolicies(String policies) {
        return policies.split(",");
    }


    /**
     * negative if versionA is less than versionB, positive if versionA is greater than versionB, and zero if they are equal. NaN is treated as 0.
     * @param versionA 
     * @param versionB 
     */
    private static int compareVersions(String versionA, String versionB) {
        Pattern versionRE = Pattern.compile("[0-9.]+(-rc.[0-9]+)?");
        versionA = versionA.trim();
        versionB = versionB.trim();
        if (!versionRE.matcher(versionA).matches()) throw new ConfigError("Invalid version");
        if (!versionRE.matcher(versionB).matches()) throw new ConfigError("Invalid version");
        if (versionA.equals(versionB)) return 0;
        // Get x.y.z-rc.a into [x.y.z, a]
        // Get x.y.z into [x.y.z]
        String[] split1A = versionA.split("-rc.");
        String[] split1B = versionB.split("-rc.");
        // Get x.y.z into [x,y,z]
        String[] split2A = split1A[0].split(".");
        String[] split2B = split1B[0].split(".");
        // For the components of the shortest version - can only compare numbers we have
        int minLength = Math.min(split2A.length, split2B.length);
        for (int idx=0; idx<minLength; ++idx) {
            if (split2A[idx] != split2B[idx]) {
                return Integer.parseInt(split2A[idx])-Integer.parseInt(split2B[idx]);
            }
        }
        // Handle 4.0 vs 4.0.1 (longer string is later)
        if (split2A.length != split2B.length) {
            return split2A.length-split2B.length;
        }
        // Handle 4.0.0 vs 4.0.0-rc.x (shorter string is later)
        if (split1A.length != split1B.length) {
            return split1B.length-split1A.length;
        }
        return Integer.parseInt(split1A[1])-Integer.parseInt(split1B[1]);
    }

    /**
     * 
     * @param archives 
     * @param toolVersion 
     */
    private static String findLatestArchiveId(Archive[] archives, String toolVersion) {
        String[] validArchiveKeywords = { "latest", "preview", "versioned" };
        for (Archive archive : archives) {
            if (Arrays.asList(validArchiveKeywords).contains(archive.id)) continue;
            // If the toolVersion is greater than or equal to the archive version we've found it
            if (compareVersions(toolVersion, archive.version) >= 0) {
                return archive.id;
            }
        }
        // Something wrong, go with the latest
        return "latest";
    }

    /**
     * This function is responsible processing the achecker config which was initialized to make sure it contains,
     * information which matches what the engine reads.
     *
     * i.e.
     *  Need to change reportLevels and failLevels to match with level declerations in the engine.
     *      replace violation with level.violation
     *  Need to change array of policies into a string
     *      ["CI162_5_2_DCP070116","CI162_5_2_DCP070116"] to "CI162_5_2_DCP070116,CI162_5_2_DCP070116"
     *
     * @param {Object} ACConfig - Provide the config object in which needs to be processed.
     *
     * @return {Object} ACConfig - return the config object which has been made engine readable
     *
     * @memberOf this
     */
    private static ConfigInternal processACConfig(ConfigInternal ACConfig) throws IOException {
        String[] validArchiveKeywords = { "latest", "preview", "versioned" };
        String ruleServer = ACConfig.ruleServer;

        // Get and parse the rule archive.
        String ruleArchiveFile = String.format("%s%s/archives.json",ruleServer,ruleServer.contains("jsdelivr.net")?"@next":"");
        Archive[] ruleArchiveParse;
        try {
            // if (ACConfig.ignoreHTTPSErrors) {
            //     process.env.NODE_TLS_REJECT_UNAUTHORIZED="0"
            // }
            ruleArchiveParse = Fetch.getJSONArr(ruleArchiveFile, Archive[].class);
        } catch (Error err) {
            System.err.println(err.toString());
            throw err;
        }
        String ruleArchivePath = null;
        if (ruleArchiveParse.length > 0) {
            if (ACConfig.DEBUG) System.out.println("Found archiveFile: " + ruleArchiveFile);
            ACConfig.ruleArchiveSet = ruleArchiveParse;
            String ruleArchive = ACConfig.ruleArchive;
            // If the user asked us to sync the rule version with the tool version, we need to figure out what the last rule version was
            if ("versioned".equals(ruleArchive)) {
                if (ACConfig.toolVersion == null) {
                    ruleArchive = "latest";
                } else {
                    ruleArchive = findLatestArchiveId(ACConfig.ruleArchiveSet, ACConfig.toolVersion);
                }
            }
            ACConfig.ruleArchiveLabel = ACConfig.ruleArchive;
            for (int i = 0; i < ACConfig.ruleArchiveSet.length; i++) {
                if (ruleArchive.equals(ACConfig.ruleArchiveSet[i].id) && !ACConfig.ruleArchiveSet[i].sunset) {
                    ruleArchivePath = ACConfig.ruleArchiveSet[i].path;
                    ACConfig.ruleArchiveVersion = ACConfig.ruleArchiveSet[i].version;
                    ACConfig.ruleArchiveLabel = ruleArchiveParse[i].name + " (" + ruleArchiveParse[i].id + ")";
                    break;
                }
            }
            if (ruleArchivePath == null || ACConfig.ruleArchiveVersion == null) {
                String errStr = "[ERROR] RuleArchiveInvalid: Make Sure correct rule archive is provided in the configuration file. More information is available in the README.md";
                System.err.println(errStr);
                throw new ConfigError(errStr);
            }
            for (int i = 0; i < ACConfig.ruleArchiveSet.length; i++) {
                if (ACConfig.ruleArchiveVersion.equals(ACConfig.ruleArchiveSet[i].version) 
                    && !Arrays.asList(validArchiveKeywords).contains(ACConfig.ruleArchiveSet[i].id)) 
                {
                    ACConfig.ruleArchivePath = ACConfig.ruleArchiveSet[i].path;
                    break;
                }
            }
            //}
        } else {
            String errStr = "[ERROR] UnableToParseArchive: Archives are unable to be parse. Contact support team.";
            System.err.println(errStr);
            throw new ConfigError(errStr);
    }

        // Build the new rulePack based of the baseA11yServerURL
        if (ACConfig.rulePack == null || "".equals(ACConfig.rulePack)) {
            if (ruleServer.contains("jsdelivr.net")) {
                ACConfig.rulePack = String.format("%s@%s", ruleServer, ACConfig.ruleArchiveVersion);
            } else {
                ACConfig.rulePack = String.format("%s%s/js", ruleServer, ruleArchivePath);
            }
        }
        ACConfig.ruleServer = ruleServer;

        if (ACConfig.DEBUG) System.err.println("Built new rulePack: " + ACConfig.rulePack);

        if (ACConfig.DEBUG) System.err.println("END 'processACConfig' function");

        // Return the updated ACConfig object
        return ACConfig;
    }

    /**
     * This function is responsible initializing all the default values for the configurations, in the case any
     * of the config options are missing.
     *
     * @param {Object} config - Provide the config object in which we need to initialize the default values.
     *
     * @return {Object} config - return the config object which has all the default values, in the case
     *                           some of the options are null or undefined.
     *
     * @memberOf this
     */
    private static void initializeDefaults(ConfigInternal config) {
        // Use an unpopulated config as the default values
        ConfigInternal ACConstants = new ConfigInternal();
        if (config.DEBUG) System.out.println("START 'initializeDefaults' function");

        if (config.DEBUG) System.out.println("Config before initialization: ");
        if (config.DEBUG) System.out.println(config);
        // Make sure all the following options are defined, otherwise reset them to default values.
        config.ruleArchiveLabel = Misc.firstNotNull(config.ruleArchiveLabel, config.ruleArchive);
        // For capture screenshots need to check for null or undefined and then set default otherwise it will evaluate the
        // boolean which causes it to always comply with the default value and not user provided option
        config.captureScreenshots = Misc.firstNotNull(config.captureScreenshots, ACConstants.captureScreenshots);

        // Build the toolID based on name and version
        config.toolID = "java-accessibility-checker-v1.0.0";
        config.toolName = "java-accessibility-checker";
        config.toolVersion = "1.0.0";

        // Using the uuid module generate a uuid number which is used to assoiciate to the scans that
        // are done for a single run of karma.
        config.scanID = java.util.UUID.randomUUID().toString();

        for (Field field : ACConstants.getClass().getDeclaredFields()) {
            try {
                field.set(config, field.get(ACConstants));
            } catch (IllegalArgumentException e) {
            } catch (IllegalAccessException e) {
            }
        }

        if (config.DEBUG) System.out.println("Config after initialization: ");
        if (config.DEBUG) System.out.println(config);

        if (config.DEBUG) System.out.println("END 'initializeDefaults' function");
    }

    /**
     * This function is responsible reading in the .yaml or .yml or .json and set the config options based on this.
     *
     * @return {Object} config - return the config object that was read in, refer to function initializeDefaults
     *                           to view how the object is to be constructed.
     *
     * @memberOf this
     */
    private static ConfigInternal loadConfigFromJSONFile() {
        // Use an unpopulated config as the default values
        ConfigInternal ACConstants = new ConfigInternal();

        if (ACConstants.DEBUG) System.out.println("START 'loadConfigFromYAMLorJSONFile' function");

        // Get the current working directory, where we will look for the yaml, yml or json file
        String workingDir = System.getProperty("user.dir");
        if (ACConstants.DEBUG) System.out.println("Working directory set to: " + workingDir);

        String[] configFiles = ACConstants.configFiles;

        ConfigInternal config = null;
        // Loop over all the possible location where the config file can reside, if one is found load it and break out.
        for (String configFile: configFiles) {
            // Get the full path to the config file we are going to check
            String fileToCheck = Paths.get(workingDir, configFile).toString();

            if (ACConstants.DEBUG) System.out.println("Checking file: " + fileToCheck);

            // Get the extension of the file we are about to scan
            String fileExtension = fileToCheck.substring(fileToCheck.lastIndexOf('.') + 1);

            // If this is a yml or yaml file verify that the file exists and then load as such.
            if ("json".equals(fileExtension)) {
                if (ACConstants.DEBUG) System.out.println("Trying to load as json or js.");

                // Need to use try/catch mech so that in the case the require throws an exception, we can
                // catch this and discatd the error, as in the case there is no config file provided then
                // we load in default values.
                try {
                    Gson gson = new Gson();
                    JsonReader reader = new JsonReader(new FileReader(fileToCheck));
                    config = gson.fromJson(reader, ConfigInternal.class);
                } catch (FileNotFoundException e) {
                    if (ACConstants.DEBUG) System.out.println("JSON or JS file ("+fileToCheck+") does not exists, will load default config.");
                }
            }
        }

        if (ACConstants.DEBUG) System.out.println("END 'loadConfigFromYAMLorJSONFile' function");

        return config;
    }

    /**
     * This function is responsible for processing the karma configuration for accessibility-checker.
     * The ACConfig provided in the Karma configuration will be processed by this
     * function and then the config variables will be assoiciated to the global space so that
     * they can be accessed from window.__karma__.config
     *
     * @param {Object} config - All the Karma configuration, we will extract what we need from this over
     *                          all object, we need the entire object so that we can reasign some config
     *                          variables to global scope so that all karma testscases/scripts can access
     *                          them.
     *
     * @return - N/A - Object will be processed and all the params that are needed for this module will
     *                 be extracted and then the entire object will be added to global space.
     *
     * @memberOf this
     */
    private static ConfigInternal processConfiguration(Config config) {
        // Use an unpopulated config as the default values
        ConfigInternal ACConstants = new ConfigInternal();
        if (ACConstants.DEBUG) System.out.println("START 'processConfiguration' function");

        // Variable Decleration
        ConfigInternal ACConfig = null;
        ConfigInternal configFromFile = null;

        // Read in the .yaml (.yml) or .json file to load in the configuration
        configFromFile = loadConfigFromJSONFile();

        if (ACConstants.DEBUG) System.out.println("Loaded config from file: ");
        if (ACConstants.DEBUG) System.out.println(configFromFile);

        // In the case configuration was provided in a yaml, yml or json file, then set this as the configuration
        // otherwise load them from the Karma configuration.
        if (configFromFile != null) {
            if (ACConstants.DEBUG) System.out.println("Using config which was loaded from config file.");

            ACConfig = configFromFile;
        } else if (config != null) {
            ACConfig = new ConfigInternal(config);
        } else {
            ACConfig = new ConfigInternal();
        }

        // In the case the ACConfig object is not defined, then define it with default config options so
        // it can be set in window.__karma__.config.ACConfig, so that we know even in the testcases, other
        // wrapper scripts that there was nothing defined at all, and at the same time to make sure that this
        // code was actually executed.
        initializeDefaults(ACConfig);

        // Now we process the final accessibility-checker config object that is build to make sure it is valid, also need to perform some
        // mapping for provided paremeters to actualy read by the engine.
        try {
            ACConfig = processACConfig(ACConfig);
        } catch (IOException e) {
            System.err.println(e);
        }

        // In the case the Karma config is set to config.LOG_DEBUG then also enable the accessibility-checker debuging
        ACConfig.DEBUG = ACConstants.DEBUG;

        if (ACConstants.DEBUG) System.out.println("END 'processConfiguration' function");
        return ACConfig;
    }

    private static ConfigInternal config = null;
    static void setConfig(Config inConfig) {
        config = ACConfigManager.processConfiguration(inConfig);
        // TODO:
        // ReporterManager.setConfig(config);
    }

    static Config getConfig() {
        return ACConfigManager.getConfigUnsupported();
    }

    static ConfigInternal getConfigUnsupported() {
        if (ACConfigManager.config == null) {
            ACConfigManager.setConfig(null);
        }
        return config;
    }
}
