export class Config {
    // static API_ENDPOINT="https://localhost:8083";
    static API_ENDPOINT=
        (typeof(document) === "undefined" || document.location.href.indexOf("localhost") !== -1)? "https://ibm-vpat-dev.mybluemix.net":
        (document.location.href.indexOf("wwwstage") !== -1? "https://ibm-vpat-dev.mybluemix.net" : 
        "https://able.ibm.com");
        
    static BASE_URL= (typeof (document) === "undefined" || document.location.href.includes("8000")) ? "http://localhost:8000/product_accessibility" : "http://localhost:8000/able/product_accessibility";
}
