// Polyfill for util.inherits which was removed in Node.js 24
// This is needed for legacy dependencies that still use it

if (typeof util === 'undefined' || !util.inherits) {
    const util = require('util');
    
    if (!util.inherits) {
        util.inherits = function(ctor, superCtor) {
            if (ctor === undefined || ctor === null)
                throw new TypeError('The constructor to "inherits" must not be null or undefined');
            
            if (superCtor === undefined || superCtor === null)
                throw new TypeError('The super constructor to "inherits" must not be null or undefined');
            
            if (superCtor.prototype === undefined)
                throw new TypeError('The super constructor to "inherits" must have a prototype');
            
            Object.defineProperty(ctor, 'super_', {
                value: superCtor,
                writable: true,
                configurable: true
            });
            Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
        };
    }
}

module.exports = {};
