type types = "string" | "number";

export const validateVars = (items: any[], types: types[]) => {
    if (items.length !== types.length) throw new Error("Lengths isn't equal");
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const type = types[i];
        if (typeof item !== type) return false;
    }
    return true;
};
