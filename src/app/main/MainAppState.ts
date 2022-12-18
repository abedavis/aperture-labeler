/**
 * @file Manages the configuration settings for the widget.
 * @author Abe Davis
 * @description AppState is the global state for your app. You can initialize app state here, including controls you
 * want to make available from the control panel.
 */
import {AAppState, AShaderMaterial, CheckAppState, SetAppState} from "../../anigraph";

export function GetAppState(){
    let appState = CheckAppState();
    if(appState===undefined){
        appState = new AAppState();
        SetAppState(appState);
    }
    return appState;
}
let appState = GetAppState();


appState.addSliderControl(AAppState.AppStateDefaultKeys.AmbientLight, 0.1, 0.0, 1.0, 0.001);

export function AddSliderUniform(mat:AShaderMaterial, name:string, initialValue?:number, min?:number, max?:number, step?:number, shouldBeUnique=false){
    let appState = GetAppState();

    /**
     * If there isn't already a slider for our variable, let's create one in the control panel.
     */
    if(appState.getState(name)===undefined){
        appState.addSliderControl(name, initialValue??1.0, min, max, step);
    }else if(shouldBeUnique){
        throw new Error(`Tried to add uniform ${name} multiple times!!!`);
    }

    /**
     * Let's initialize the uniform on the material
     */
    mat.setUniform(name, appState.getState(name));

    /**
     * And now let's have the material listen for changes to the app state controlled by our slider.
     */
    mat.subscribe(
        appState.addStateValueListener(name, ()=>{
            mat.setUniform(name, appState.getState(name));
        }),
        `${name}_update`
    );
}
