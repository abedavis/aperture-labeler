export enum AniGraphDefines {
    DefaultZNear = 0.05,
    DefaultZFar = 500,
}


export function TextureKeyForName(name: string) {
    return name + "Map";
}
export function TextureProvidedKeyForName(name: string) {
    return name + "MapProvided";
}
export function TextureSizeKeyForName(name: string) {
    return name + "Size";
}

export const ANIGRAPH_DEBUG_MODE = false;
