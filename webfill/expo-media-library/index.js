
export const saveToLibraryAsync = uri => {
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = uri;
    a.download = 'media';
    a.click();
    URL.revokeObjectURL(uri);
    a.remove();

}

export const getPermissionsAsync = () => {
    return { status: 'granted', granted: true }
}

export const requestPermissionsAsync = () => {
    return { status: 'granted', granted: true }
}
