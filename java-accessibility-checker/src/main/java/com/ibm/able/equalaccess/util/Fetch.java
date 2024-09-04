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
package com.ibm.able.equalaccess.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import com.google.gson.Gson;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.X509TrustManager;

public class Fetch {
    private Fetch() {}

    private static Gson gson = new Gson();

    public static String get(String urlStr) throws IOException {
        return get(urlStr, false);
    }
    
    public static String get(String urlStr, boolean ignoreSSL) throws IOException {
        SSLSocketFactory factory = HttpsURLConnection.getDefaultSSLSocketFactory();
        HostnameVerifier verifier = HttpsURLConnection.getDefaultHostnameVerifier();

        if (ignoreSSL) {
            try {
                SSLContext sc = SSLContext.getInstance("TLS");
                sc.init(null, new TrustManager[] { new X509TrustManager() {
                
                    public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) {
                    }
                
                    public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) {
                    }

                    @Override
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                        return new java.security.cert.X509Certificate[0];
                    }
                }}, new java.security.SecureRandom());
                HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
                HttpsURLConnection.setDefaultHostnameVerifier(new HostnameVerifier() {

                    @Override
                    public boolean verify(String hostname, SSLSession session) {
                        return true;
                    }
                });
            } catch (Error err) {
                System.err.println("Ignoring SSL Err! "+err);
            } catch (Exception err2) {
                System.err.println("Ignoring SSL Err! "+err2);
            }
        }
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        BufferedReader br = new BufferedReader(new InputStreamReader((conn.getInputStream())));
        StringBuilder sb = new StringBuilder();
        String output;
        while ((output = br.readLine()) != null) {
            sb.append(output);
        }
        if (ignoreSSL) {
            HttpsURLConnection.setDefaultSSLSocketFactory(factory);
            HttpsURLConnection.setDefaultHostnameVerifier(verifier);
        }
        return sb.toString();
    }

    public static <T> T[] getJSONArr(String urlStr, Class<T[]> clazz) throws IOException {
        return getJSONArr(urlStr, clazz, false);
    }

    public static <T> T[] getJSONArr(String urlStr, Class<T[]> clazz, boolean ignoreHTTPSErrors) throws IOException {
        return gson.fromJson(Fetch.get(urlStr, ignoreHTTPSErrors), clazz);
    }

    public static <T> T getJSONObj(String urlStr, Class<T> clazz) throws IOException {
        return getJSONObj(urlStr, clazz, false);
    }
    
    public static <T> T getJSONObj(String urlStr, Class<T> clazz, boolean ignoreHTTPSErrors) throws IOException {
        return gson.fromJson(Fetch.get(urlStr, ignoreHTTPSErrors), clazz);
    }
}
