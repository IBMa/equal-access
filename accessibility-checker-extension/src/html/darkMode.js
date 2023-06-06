function darkMode() {
        // Check to see if Media-Queries are supported
    if (window.matchMedia) {
    // Check if the dark-mode Media-Query matches
    if(window.matchMedia('(prefers-color-scheme: dark)').matches){
        // Dark g90
        console.log("change body element to class = g90");
        body.setAttribute("class", "cds--g90");
    } else {
        // Light g10
        console.log("change body element to class = g10");
        body.setAttribute("class", "cds--g10");
    }
    } else {
    // Default (when Media-Queries are not supported)
    console.log("watch.media not supported")
    }
}