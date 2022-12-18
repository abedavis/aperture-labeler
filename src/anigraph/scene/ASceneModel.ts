import {AModel, AModelInterface} from "../base/amvc/AModel";
import {AObject, AObjectNodeEvents, AObjectState} from "../base/aobject";
import {ASerializable} from "../base/aserial";
import {ANodeModel} from "./nodeModel";
import {HasModelMap, MVMModelMap} from "../base/amvc/AModelViewMap";
import {ACameraModel} from "./camera";
import {Vec2, Vec3, Vector} from "../math";
import {BezierTween} from "../geometry";
import {AMaterialManager} from "../rendering/material";
import {CallbackType} from "../basictypes";
import {ACallbackSwitch} from "../base";
import {AInteraction, AInteractionEvent,
    AInteractionMode,
    AInteractionModeMap,
    BasicInteractionModes} from "../interaction";

import {AClock} from "../time";
import {v4 as uuidv4} from "uuid";
import {HasInteractions} from "../base/amvc/HasInteractions";

import {Mutex} from 'async-mutex';

export enum SceneEvents{
    SceneNodeModelAdded="SceneNodeModelAdded", // this event should trigger the creation of a view
    NodeAdded="NodeAdded", // This does not directly trigger the creation of a view
    NodeRemoved="NodeRemoved",
    NodeMoved="NodeMoved",
    UpdateComponent="UpdateComponent"
}

enum ASCENEMODEL_EVENT_HANDLES{
    SCENE_NODE_ADDED="SCENE_NODE_ADDED",
    SCENE_NODE_REMOVED="SCENE_NODE_REMOVED"
}

@ASerializable("ASceneModel")
export abstract class ASceneModel extends AModel implements HasModelMap, HasInteractions{
    static SceneEvents=SceneEvents;
    @AObjectState protected _isInitialized!:boolean;
    cameraModel!:ACameraModel;
    protected _materials!:AMaterialManager;
    get materials(){
        return this._materials;
    }
    protected _clock: AClock;
    protected _interactionDOMElement:EventTarget;
    protected _initializedPromise!:Promise<boolean>;
    protected initMutex:Mutex;

    get initializedPromise(){return this._initializedPromise;}

    get camera(){
        return this.cameraModel.camera;
    }

    abstract getCoordinatesForCursorEvent(event:AInteractionEvent):Vec2;

    get eventTarget(){
        return this._interactionDOMElement;
    }

    /**
     * Interaction mode map. Has a .modes property that maps mode names to AInteractionModes.
     * @type {AInteractionModeMap}
     * @protected
     */
    protected _interactions!: AInteractionModeMap;
    /**
     * Right now, controllers are restricted to having one or zero active modes at a time. The name of the current mode, which can be active or inactive, is stored here.
     * @type {string}
     * @protected
     */
    protected _currentInteractionModeName: string;

    get clock() {
        return this._clock;
    }

    protected abstract initScene():Promise<void>;


    // abstract initShaders():Promise<void>;
    async initShaders(){
        this._materials = new AMaterialManager();
    }

    abstract initCamera():void;

    /**
     * # Initialization:
     * Scene models are initialized asynchronously, and initialization may be triggered lazily by the first controller
     * that tries to access the model (it can also be triggered more proactively, depending on the application).
     * The scene model has a state variable `isInitialized` that is set to false in the constructor, but flipped to true
     * after initialization is performed.
     *
     * To trigger initialization, the function `confirmInitialized` must be called at least once.
     *
     *
     */
    async confirmInitialized(){
        await this.initMutex.runExclusive(async () => {
            if(!this._isInitialized){
                this._isInitialized = await this._asyncInitScene();
                this._isInitialized = true;
                this._clock.play();
            }
        });
    }

    protected async _asyncInitScene():Promise<boolean>{
        await this.initShaders();
        await this.PreloadAssets()
        await this.initScene();
        return true;
    }

    async PreloadAssets(){
        // this.materials.setMaterialModel()
        // await this.materials.materialsLoadedPromise;
    }


    protected _modelMap:MVMModelMap={};
    get modelMap(){
        return this._modelMap;
    }


    get isInitialized(){
        return this._isInitialized;
    }

    addIsInitializedListener(callback:(self:AObject)=>void, handle?:string, synchronous:boolean=true):ACallbackSwitch{
        return this.addStateKeyListener('_isInitialized', callback, handle, synchronous);
    }

    addComponentUpdateListener(callback:(self:AObject)=>void, handle?:string):ACallbackSwitch{
        return this.addEventListener(ASceneModel.SceneEvents.UpdateComponent, callback, handle);
    }

    signalComponentUpdate(){
        this.signalEvent(ASceneModel.SceneEvents.UpdateComponent);
    }


    protected _addModel(model:AModelInterface){
        if(this.hasModel(model)){
            throw new Error(`Model ${model} with uid ${model.uid} already in ${this.serializationLabel}`)
        }
        this.modelMap[model.uid]=model;
        this.signalEvent(SceneEvents.NodeAdded, model);
    }
    protected _removeModel(model:AModelInterface){
        delete this._modelMap[model.uid];
        this.signalEvent(SceneEvents.NodeRemoved, model);
    }

    hasModel(model:AModelInterface){
        return (model.uid in this.modelMap);
    }

    hasModelID(modelID:string){
        return (modelID in this.modelMap);
    }

    constructor(name?:string) {
        super(name);
        this.initMutex = new Mutex();
        this._clock = new AClock();
        this._interactionDOMElement = document;
        this._interactions = new AInteractionModeMap(this);
        this._currentInteractionModeName = BasicInteractionModes.Default;
        this._isInitialized = false;
        // this._materials = new AMaterialManager();



        this._initSceneGraphSubscriptions();
        // this.materials = new AMaterialManager();
        // appstate assigns this when model is created
        // this.appState = GetAppState();
    }

    protected _initSceneGraphSubscriptions(){
        const self = this;
        this.subscribe(this.addEventListener(AObjectNodeEvents.NewDescendant, (descendant:ANodeModel)=>{
            self._addModel(descendant);
        }), ASCENEMODEL_EVENT_HANDLES.SCENE_NODE_ADDED);

        this.subscribe(this.addEventListener(AObjectNodeEvents.DescendantRemoved, (descendant:ANodeModel)=>{
            self._removeModel(descendant);
        }), ASCENEMODEL_EVENT_HANDLES.SCENE_NODE_REMOVED);
    }

    async loadShader(name:string){
        return this.materials.loadShaderModel(name);
    }
    async loadLineShader(name:string){
        return this.materials.loadLineShaderModel(name);
    }

    getDescendantList(){
        return super.getDescendantList() as ANodeModel[];
    }

    addTimedAction(callback: (actionProgress: number) => any, duration: number, actionOverCallback?: CallbackType, tween?: BezierTween, handle?: string) {
        if (handle && (handle in this._subscriptions)) {
            return;
        }
        const self = this;
        const subscriptionHandle = handle ?? uuidv4();
        this.subscribe(this._clock.CreateTimedAction(callback, duration, () => {
                self.unsubscribe(subscriptionHandle);
                if (actionOverCallback) {
                    actionOverCallback();
                }
            }, tween),
            subscriptionHandle);
    }


    /**
     * Getter for the current interaction mode.
     * @returns {AInteractionMode}
     */
    get interactionMode() {
        return this._interactions.modes[this._currentInteractionModeName];
    }


    /**
     * Add an interaction to the current mode.
     * @param interaction
     */
    addInteraction(interaction: AInteraction) {
        this.interactionMode.addInteraction(interaction);
        // interaction.owner = this;
        return interaction;
    }

    activateInteractions() {
        this.interactionMode.activate();
    }

    setCurrentInteractionMode(name?: string) {
        this.interactionMode.deactivate();
        let activeMode = name ? name : BasicInteractionModes.Default;
        this._interactions.setActiveMode(activeMode);
        this._currentInteractionModeName = activeMode;
    }

    defineInteractionMode(name: string, mode?: AInteractionMode) {
        this._interactions.defineMode(name, mode);
    }

    clearInteractionMode(name: string) {
        this._interactions.undefineMode(name)
    }

    isInteractionModeDefined(name: string):boolean {
        return this._interactions.modeIsDefined(name);
    }



}





