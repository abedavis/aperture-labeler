import * as THREE from "three";
import {
    AController, AModel,
    AModelInterface, AObjectNode, AObjectState,
    AView, GetAppState,
    HasModelViewMap,
    SceneControllerInterface
} from "../base";
import {AInteractionEvent, AInteractionMode, HasInteractionModeCallbacks} from "../interaction";
import {ClassInterface} from "../basictypes";
import {AGLContext, AGLRenderWindow, ARenderDelegate, AShaderModel, ShaderManager} from "../rendering";
import {ASceneModel, SceneEvents} from "./ASceneModel";
import {ASceneView} from "./ASceneView";
import {ACameraModel, ACameraView} from "./camera";
import {ANodeModel} from "./nodeModel";
import {_ANodeView, ANodeView} from "./nodeView";
import {AModelViewClassMap, AMVClassSpec, AMVClassSpecDetails} from "../base/amvc/AModelViewClassSpec";
import {ADataTexture} from "../rendering/image";
import {ASceneInteractionMode} from "./interactionmodes";


export enum SceneControllerSubscriptions {
    ModelNodeAdded = "ModelNodeAdded",
    ModelNodeRemoved = "ModelNodeRemoved"
}

export interface RenderTargetInterface{
    target:THREE.WebGLRenderTarget|null
}

const INTERACTION_MODE_APP_STATE = "InteractionMode";

export abstract class ASceneController extends AController implements ARenderDelegate, HasModelViewMap, SceneControllerInterface {
    @AObjectState protected readyToRender:boolean;
    classMap:AModelViewClassMap;
    _renderWindow!: AGLRenderWindow;
    protected _model!: ASceneModel;
    protected _view!: ASceneView;
    protected _cameraView!: ACameraView;
    abstract initScene():Promise<void>;

    abstract initModelViewSpecs():void;
    abstract onAnimationFrameCallback(context: AGLContext): void
    // abstract initCamera():void;
    abstract initInteractions():void;

    getCoordinatesForCursorEvent(event:AInteractionEvent){
        return this.model.getCoordinatesForCursorEvent(event);
    }


    setRenderTarget(renderTarget?:RenderTargetInterface){
        if(renderTarget) {
            this.renderer.setRenderTarget(renderTarget.target)
        }else{
            this.renderer.setRenderTarget(null);
        }
    }


    get isReadyToRender(): boolean {
        return this.readyToRender;
    }

    get renderWindow(): AGLRenderWindow {
        return this._renderWindow;
    }

    get renderer(): THREE.WebGLRenderer {
        return this.renderWindow.renderer;
    }

    get sceneController(){
        return this;
    }

    get eventTarget(): HTMLElement {
        return this.renderWindow.contextElement;
    }

    constructor(model: ASceneModel) {
        super();
        this.readyToRender=false;
        this.classMap = new AModelViewClassMap();
        this.onModelNodeAdded = this.onModelNodeAdded.bind(this);
        this.onModelNodeRemoved = this.onModelNodeRemoved.bind(this);

        this.addModelViewSpec(ACameraModel, ACameraView);
        this.initModelViewSpecs();

        if (model) {
            this.setModel(model)
        }
    }

    async PreloadAssets(){
        // await this.model.PreloadAssets();
    };

    async initRendering(renderWindow: AGLRenderWindow) {
        this._renderWindow = renderWindow;
        this._view = new ASceneView(this);
        this.addView(this.view);
        this.renderer.autoClear = false;
        this.renderer.clear()
        await this.model.confirmInitialized();
        // this._cameraView = ACameraView.Create(this.model.cameraModel);
        // this.addView(this._cameraView);
        await this.initScene();
        this._initInteractionsListener();
        this.initInteractions();
        this.addModelSubscriptions();

        let cameraView = this.getCameraView(this.model.cameraModel);
        if(cameraView && cameraView instanceof ACameraView){
            this._cameraView = cameraView;
        }else{
            throw new Error("Error initializing camera view");
        }
        // this.addView(this._cameraView);

        ADataTexture.CheckWebGLSupport(this.renderer);
        this.readyToRender = true;
    }


    getCameraView(cameraModel:ACameraModel){
        return this.getViewListForModel(cameraModel)[0];
    }




    createViewForNodeModel(nodeModel: ANodeModel){
        let spec = this.classMap.getSpecForModel(nodeModel);
        if(spec){
            let view = new (spec.viewClass)();
            view.setModel(nodeModel);
            view.setController(this);
            return view;
        } else{
            throw new Error(`Unsure how to create view for ${nodeModel} with class ${nodeModel.constructor.name}. This often happens for one of the following reasons: 1) You did not add a custom model/view pair to the class spec in the scene controller. 2) You did not decorate a custom model class with @ASerializable(...). In this case check out one of the example models for how to add the decorator.`)
        }
    }

    addModelViewSpec(modelClass:ClassInterface<ANodeModel>, viewClass:ClassInterface<AView>, details?:AMVClassSpecDetails){
        this.classMap.addSpec(new AMVClassSpec(modelClass, viewClass, details))
    }

    setModel(model: ASceneModel) {
        if (this._model && this._model !== model) {
            this._unSetModel();
        }
        this._model = model;
        this._view = new ASceneView(this);
        this.view.addView(this.view);
    }

    protected addModelSubscriptions() {
        const self = this;
        this.subscribe(this.model.addEventListener(SceneEvents.NodeAdded, (node: ANodeModel) => {
            self.onModelNodeAdded(node);
        }), SceneControllerSubscriptions.ModelNodeAdded);
        this.subscribe(this.model.addEventListener(SceneEvents.NodeRemoved, (node: ANodeModel) => {
            self.onModelNodeRemoved(node);
        }), SceneControllerSubscriptions.ModelNodeRemoved);
        this.model.mapOverDescendants((descendant:AObjectNode)=>{
            self.onModelNodeAdded(descendant as ANodeModel);
        })

    }

    protected _unSetModel() {
        this.clearSubscriptions();
        this.view.release();
    }

    get model(): ASceneModel {
        return this._model as ASceneModel;
    }

    get view(): ASceneView {
        return this._view as ASceneView;
    }

    get cameraModel(){
        return this._cameraView.model;
    }

    get camera() {
        return this.cameraModel.camera;
    }

    // get clock() {
    //     return this._clock;
    // }

    protected get _threeCamera() {
        return this._cameraView.threejs;
    }

    get modelMap() {
        return this.model.modelMap
    };

    get viewMap() {
        return this.view.viewMap;
    }

    hasModel(model: AModelInterface) {
        if(model.uid===this.model.uid){return true;}
        return this.model.hasModel(model);
    };

    hasView(view: AView) {
        return this.view.hasView(view);
        // return (this.model.hasModelID(view.modelID) && view.uid in this.viewMap[view.modelID]);
    }

    addView(view: AView) {
        view.setController(this);
        this.view.addView(view);
        if(view.model.parent!==null){
            view.model.signalNewParent(view.model.parent as AModel);
        }
    }

    removeView(view: AView) {
        this.view.removeView(view);
    }

    getViewListForModel(model: AModelInterface) :ANodeView[]{
        return this.view.getViewListForModel(model) as ANodeView[];
    }

    onModelNodeAdded(nodeModel: ANodeModel) {
        let newView = this.createViewForNodeModel(nodeModel) as ANodeView;
        this.addView(newView);
        // this.view.addView(newView);
        // if(nodeModel.parent!==null){
        //     nodeModel.signalNewParent(nodeModel.parent as AModel);
        // }
    }

    onModelNodeRemoved(nodeModel: ANodeModel) {
        let views = this.view.getViewListForModel(nodeModel);
        for (let v of views) {
            v.release();
        }
        delete this.viewMap[nodeModel.uid];
    }

    onResize(renderWindow: AGLRenderWindow): void {
        this.renderer.setSize(renderWindow.container.clientWidth, renderWindow.container.clientHeight);
        this.camera.onCanvasResize(renderWindow.container.clientWidth, renderWindow.container.clientHeight);
    }

    async loadShader(name:string){
        return this.model.loadShader(name);
    }
    async loadLineShader(name:string){
        return this.model.loadLineShader(name);
    }



    _setCurrentInteractionMode(name?:string){
        super.setCurrentInteractionMode(name);
    }

    setCurrentInteractionMode(name?: string) {
        this._setCurrentInteractionMode(name);
        this._updateInteractionModeOptions();
    }


    _initInteractionsListener(){
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
