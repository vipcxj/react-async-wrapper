export const some = (arr, pred) =>{
    arr = arr || [];
    for (let i = 0; i < arr.length; ++i) {
        if (pred && pred(arr[i])) {
            return true;
        }
    }
    return false;
};

export const toPairs = obj => obj ? Object.keys(obj).map(k => [k, obj[k]]) : [];

export const fromPairs = (arr) => {
    const ret = {};
    (arr || []).forEach(([k, v]) => ret[k] = v);
    return ret;
};

export const isFunction = func => typeof func === "function";