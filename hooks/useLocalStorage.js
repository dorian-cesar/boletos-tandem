export const useLocalStorage = () => {

    const getItem = (key) => {
        const value = localStorage.getItem(key);
        try{
            return JSON.parse(value);
        } catch (e) {
            return null;
        }
    }

    const setItem = (key, value) => {
        value = JSON.stringify(value);
        localStorage.setItem(key, value);
    }

    const clear = () => {
        localStorage.clear();
        window.location.reload(false);
    }

    return {
        getItem,
        setItem,
        clear
    }
}