const { exec } = require("child_process");

function myExec(cmd)  {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error.message);
                return;
            }
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve(stdout);
        });    
    });
}

(async () => {
    await myExec(`sed -i'.old' -e "s/[\\"|']use strict[\\"|']//g" ./node_modules/exceljs/dist/exceljs.min.js`);
    await myExec(`sed -i'.old' -e "s/[\\"|']use strict[\\"|']//g" ./node_modules/exceljs/dist/exceljs.js`);
})()