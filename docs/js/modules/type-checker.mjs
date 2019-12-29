export { as, abstract };

function as(x, typeName, condition = true) {
    let ok = false;

    if(typeof x === 'object') {
        ok =  x instanceof typeName;
    } else {
        switch(typeName) {
            case String:
                ok = (typeof x === 'string');
                break;
            case Number:
                ok = (typeof x === 'number');
                break;
            case Boolean:
                ok = (typeof x === 'boolean');
                break;
            default:
                ok = false;
                break;
        }
    }

    if(!ok) {
        throw new TypeError("Argument '" + x + "' must be a " + typeName.name);
    }

    if(!condition) {
        throw new TypeError("Argument '" + x + "' don't match the condition");
    }
}

function abstract(new_target, typeName) {
    /* Abstract class checker */
    if(new_target === typeName) {
        throw new TypeError("Cannot construct abstract instances directly");
    }
}
