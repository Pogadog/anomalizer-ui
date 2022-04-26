

export const getItemAsync = async key => {
    return window.localStorage.getItem(key) ?? null;
}

export const setItemAsync = async (key, value) => {
    window.localStorage.setItem(key, value);
    return true;
}

export const deleteItemAsync = async (key) => {
    window.localStorage.removeItem(key);
};

