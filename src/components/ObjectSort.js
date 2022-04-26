


/**
 * Sort an object of objects by key into an array
 * @param {array} array - The array to be sorted
 * @param {string} key - The key to sort the array
 * @param {string} idId - The key to put the original object key under when converted to list
 */

export default function ObjectSort(obj, key, order="asc", idId="id") {

    let array = [];
    for (let i in obj) {
        obj[i][idId] = i;
        array.push(obj[i]);
    }

    let a = array.sort(function(a, b) {
        let keyA = a[key];
        let keyB = b[key];

        if (order === 'asc') {
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
        } else if (order === 'desc') {
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
        }
        return 0;
    });

    return a;
}