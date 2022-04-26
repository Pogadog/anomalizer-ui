const getDir = dir => {

    if (!window.fileSystem) {
        window.fileSystem = {}
    }

    if (window.fileSystem[dir]) {
        return { isDirectory: false, exists: true, data: window.fileSystem[dir]};
    } else {
        let items = Object.keys(window.fileSystem);
        let potentialDir = {}
        for (let item of items) {
            if (item.includes(dir)) {
                potentialDir[item] = window.fileSystem[item];
            }
        }
        if (Object.keys(potentialDir).length) {
            return { isDirectory: true, exists: true, data: potentialDir };
        } else {
            return { isDirectory: false, exists: false }
        }
    }


}

const putDir = (dir, data) => {
    if (!window.fileSystem) {
        window.fileSystem = {};
    }
    console.log("will put", data);
    window.fileSystem[dir] = data;
}

const delDir = dir => {
    if (!window.fileSystem) {
        window.fileSystem = {};
    }
    delete window.fileSystem[dir];
}

export const getInfoAsync = async (dir) => {
    return getDir(dir);
}

export const deleteAsync = async dir => {
    return delDir(dir);
}

export const writeAsStringAsync = async (dir, data) => {
    return putDir(dir, data);
}

export const readAsStringAsync = async dir => {
    return (getDir(dir)).data ?? '';
}

export const makeDirectoryAsync = async dir => {
    return true;
}

export const downloadAsync = async (uri, dir) => {
    try {
        let r = await fetch(uri);
        let blob = await r.blob();
        putDir(dir, blob);
        return { md5: null }
    } catch (e) {
        console.warn(e);
        return { md5: null }
    }
}

export const documentDirectory = 'documents/'
export const cacheDirectory = 'cache/'
