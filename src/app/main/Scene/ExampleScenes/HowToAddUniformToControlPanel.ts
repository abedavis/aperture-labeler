import {AShaderMaterial, GetAppState} from "../../../../anigraph";

let appState = GetAppState();

export function ConnectMatUniformToControlPanel(uniformName:string, stateName:string, mat:AShaderMaterial, initialValue?:number, min?:number, max?:number, step?:number){
    /**
     * appState.addSliderIfMissing is a helper function that will check whether the control panel currently has a given slider control in it.
     * If the control is not there, then we will add it with the provided parameters.
     * @param name
     * @param initialValue: initial value for app state
     * @param min: minimum value of slider
     * @param max: maximum value of slider
     * @param step: step size of slider
     */
    appState.addSliderIfMissing(stateName, initialValue, min, max, step);

    /**
     * Here we attach the uniform to particular app state (in this case, the slider control we set above). This means that when we update the app state, the uniform will be updated automatically as well.
     */
    mat.attachUniformToAppState(uniformName, appState, stateName);
}

/**
 * It may be useful to write a helper function that connects common uniforms
 * @param mat
 * @constructor
 */
export function AddStandardUniforms(mat:AShaderMaterial){
    let appState = GetAppState();
    ConnectMatUniformToControlPanel('ambient', 'ambient', mat, 0.05, 0, 2, 0.01);
    ConnectMatUniformToControlPanel('diffuse', 'diffuse', mat, 1.0, 0, 3, 0.01);
    ConnectMatUniformToControlPanel('specular', 'specular', mat, 1.0, 0, 3, 0.01);
}

