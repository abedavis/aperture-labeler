import {
    AGLContext,
    AInteractionMode,
    ANodeModel, ASceneController, Color,
    GetAppState, HasInteractionModeCallbacks,
} from "../../anigraph";
import {BaseSceneModel} from "./BaseSceneModel";
import {ASceneInteractionMode} from "../../anigraph/scene/interactionmodes/ASceneInteractionMode";

const INTERACTION_MODE_APP_STATE = "InteractionMode";

export abstract class BaseSceneController extends ASceneController {
    get model(): BaseSceneModel {
        return this._model as BaseSceneModel;
    }
    async initScene(): Promise<void> {
        this.view.setBackgroundColor(Color.FromString("#000000"));
        // this.view.loadSkyBox();
    }
    abstract initModelViewSpecs():void;

    onAnimationFrameCallback(context: AGLContext) {
        this.model.timeUpdate(this.model.clock.time);

        context.renderer.clear();
        // this.renderer.clear(false, true);

        // render the scene view
        context.renderer.render(this.view.threejs, this._threeCamera);
    }

    createViewForNodeModel(nodeModel: ANodeModel) {
        return super.createViewForNodeModel(nodeModel)
    }

    //###############################################//--Defining Interaction Modes--\\###############################################
    //<editor-fold desc="Defining Interaction Modes">



    _setCurrentInteractionMode(name?:string){
        super.setCurrentInteractionMode(name);
    }

    setCurrentInteractionMode(name?: string) {
        this._setCurrentInteractionMode(name);
        this._updateInteractionModeOptions();
    }


    initInteractions(){
        const self = this;
        this.subscribeToAppState(INTERACTION_MODE_APP_STATE, (v:string)=>{
            /**
             * Call _setCurrentInteractionMode here, which just calls the parent version of the function.
             * This is to avoid an infinite loop caused by calling _updateInteractionModeOptions
             */
            self._setCurrentInteractionMode(v);
        }, INTERACTION_MODE_APP_STATE)
    }

    defineInteractionMode(name: string, mode?: AInteractionMode) {
        super.defineInteractionMode(name, mode);
        this._updateInteractionModeOptions();
    }

    _updateInteractionModeOptions(){
        let appState = GetAppState();
        appState.setSelectionControl(
            INTERACTION_MODE_APP_STATE,
            this._currentInteractionModeName,
            this._interactions.getGUISelectableModesList()
        )
        appState.updateControlPanel();
    }

    createNewInteractionMode(
        name:string,
        interactionCallbacks?:HasInteractionModeCallbacks
    ){
        if(this._interactions.modes[name]){
            throw new Error(`Tried to create interaction mode "${name}", but mode with this name is already defined!`)
        }
        let newInteractionMode = new ASceneInteractionMode(name, this, interactionCallbacks);
        this.defineInteractionMode(name, newInteractionMode);
    }

}
