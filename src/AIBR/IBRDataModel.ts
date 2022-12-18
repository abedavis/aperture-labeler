import {
    ACamera, AController, AGLContext, AInteractionEvent,
    ANodeModel3D,
    AObject,
    AObjectState, ASceneController, ASceneModel,
    ASerializable, Mat4, NodeTransform3D, V2,
    V3, Vec2,
    Vec3, Vec4,
    Vector,
    VertexArray3D
} from "../anigraph";
import {IBRSceneData} from "./IBRSceneData";
import {IBRCapturedImage} from "./IBRCapturedImage";
import {folder} from "leva";
import * as THREE from "three";
import {ViewReprojectionShaderMaterial} from "./shadermodels";
import {MAX_TEX_PER_CALL} from "../anigraph/rendering/material/shadermodels";
import {AWheelInteraction} from "../anigraph/interaction/AWheelInteraction";
import * as IBRShaders from "./IBRShaders";

enum CONSTANTS {
    FOCUS_DISTANCE_CHANGE_FACTOR = 0.01,
}

export enum IBR_MODEL_EVENTS {
    IBR_SCENE_CHANGE = "IBR_SCENE_CHANGE",
}

export enum IBR_TEMPORAL_FILTERS {
    Date = "Date",
    TimeOfDay = "TimeOfDay",
    SunAngle = "SunAngle",
}

export enum IBR_SPATIAL_FILTERS {
    Angle = "Angle",
    Position = "Position",
}

export enum IBR_FILTER_ORDER {
    ForTime_ST = "ForTime_ST",
    ForSpace_TS = "ForSpace_TS",
}

export enum IBR_TIME_INTERPOLATION_MODES {
    Neighborhood = "Neighborhood",
    Value = "Value",
}

export enum IBR_SPACE_INTERPOLATION_MODES {
    Neighborhood = "Neighborhood",
    Value = "Value",
}

export enum IBR_PROGRESS_MODES {
    Value = "Value",
    Order = "Order",
}

function gaussian(x: number, sigma: number, m: number = 0) {
    let ep = (x - m) / sigma;
    let ep2 = ep * ep;
    return (1 / (sigma * 2.50662827463)) * Math.exp(-0.5 * ep2);
}

/***
 * Abstracts out the application time data for the scene
 * The model's verts and material correspond to the focal plane
 */
@ASerializable("IBRSceneModel")
export class IBRDataModel extends ANodeModel3D {


    static TimeFilters = IBR_TEMPORAL_FILTERS;
    static SpaceFilters = IBR_SPATIAL_FILTERS;
    static TimeInterpolationModes = IBR_TIME_INTERPOLATION_MODES;
    static SpaceInterpolationModes = IBR_SPACE_INTERPOLATION_MODES;
    static ProgressModes = IBR_PROGRESS_MODES;
    @AObjectState filterOrder!: IBR_FILTER_ORDER;
    @AObjectState timeFilter!: IBR_TEMPORAL_FILTERS;
    @AObjectState spaceFilter!: IBR_SPATIAL_FILTERS;
    @AObjectState timeInterpolationMode!: IBR_TIME_INTERPOLATION_MODES;
    @AObjectState spaceInterpolationMode!: IBR_SPACE_INTERPOLATION_MODES;
    @AObjectState timeScoreWeight!: number;
    @AObjectState spaceScoreWeight!: number;
    @AObjectState timeAperture!: number;
    @AObjectState spaceAperture!: number;
    @AObjectState fixedFocalPlane!: boolean;
    // right now, neighbors in time are selected first, and then from them neighbors in space
    // are selected. So nTimeNeighbors > nSpaceNeighbors

    @AObjectState focusTargetPoint!: Vec3;
    sceneData!: IBRSceneData;
    @AObjectState _virtualCamera!: ACamera;
    _neighborhoodViews: IBRCapturedImage[] = [];
    // _sortedViewsSpace:IBRCapturedImage[]=[];
    // _sortedViewsTime:IBRCapturedImage[]=[];
    // _params!:IBRReconstructionParams;

    // @AObjectState _targetTime!:number;
    // @AObjectState _targetTimeIndex!:number;

    // The target time value being reconstructed
    @AObjectState _targetTimeValue!: number;

    @AObjectState filterTime!: boolean;
    @AObjectState filterSpace!: boolean;
    @AObjectState filterActive!: boolean;
    @AObjectState nTimeNeighbors!: number;
    @AObjectState nSpaceNeighbors!: number;
    @AObjectState showGUI: boolean;
    @AObjectState showFocusSphere: boolean;
    @AObjectState progressMode: IBR_PROGRESS_MODES;



    static async CreateForScene(path:string){
        let ibrScene = await IBRSceneData.FromPathCOLMAP(path);
        let ibrSceneModel = new this();
        await ibrScene.loadTextures();
        ibrSceneModel.setIBRScene(ibrScene);
        return ibrSceneModel;
    }


    static _GetTemporalFilterModes() {
        let amodes = this.TimeFilters;
        let rval: { [name: string]: string } = {};
        for (let vm in amodes) {
            rval[vm] = vm;
        }
        return rval;
    }

    static _GetFilterOrders() {
        let amodes = IBR_FILTER_ORDER;
        let rval: { [name: string]: string } = {};
        for (let vm in amodes) {
            rval[vm] = vm;
        }
        return rval;
    }

    static _GetProgressModes() {
        let amodes = IBR_PROGRESS_MODES;
        let rval: { [name: string]: string } = {};
        for (let vm in amodes) {
            rval[vm] = vm;
        }
        return rval;
    }

    /**
     * We will add the custom parameters to the gui controls with leva...
     * @returns {{enemySpeed: {min: number, max: number, step: number, value: number}}}
     */
    getModelGUIControlSpec(): { [p: string]: any } {
        const self = this;
        let nCapturedImages = this.sceneData?.nCapturedImages;
        return {
            // ...super.getControlPanelStandardSpec(),
            SpaceTimeFilter: folder(
                {
                    TimeFilterMode: {
                        value: self.timeFilter,
                        options: IBRDataModel._GetTemporalFilterModes(),
                        onChange: (v: any) => {
                            self.timeFilter = v;
                            self.updateReconstruction();
                        },
                    },
                    FilterOrder: {
                        value: self.filterOrder,
                        options: IBRDataModel._GetFilterOrders(),
                        onChange: (v: any) => {
                            self.filterOrder = v;
                            self.updateReconstruction();
                        },
                    },
                    ProgressMode: {
                        value: self.progressMode,
                        options: IBRDataModel._GetProgressModes(),
                        onChange: (v: any) => {
                            self.progressMode = v;
                            self.updateReconstruction();
                        },
                    },
                    nTimeNeighbors: {
                        value: self.nTimeNeighbors,
                        onChange: (v: any) => {
                            self.nTimeNeighbors = v;
                        },
                        min: 0,
                        max: nCapturedImages,
                        step: 0.1,
                    },
                    nSpaceNeighbors: {
                        value: self.nTimeNeighbors,
                        onChange: (v: any) => {
                            self.nSpaceNeighbors = v;
                        },
                        min: 0,
                        max: nCapturedImages,
                        step: 0.1,
                    },
                    TimeAperture: {
                        value: self.timeAperture,
                        onChange: (v: any) => {
                            self.timeAperture = v;
                        },
                        min: 0,
                        max: 20.0,
                        step: 0.1,
                    },
                    TimeWeight: {
                        value: self.timeScoreWeight,
                        onChange: (v: any) => {
                            self.timeScoreWeight = v;
                        },
                        min: 0,
                        max: 20.0,
                        step: 0.1,
                    },
                    SpaceAperture: {
                        value: self.spaceAperture,
                        onChange: (v: any) => {
                            self.spaceAperture = v;
                        },
                        min: 0,
                        max: 20.0,
                        step: 0.1,
                    },
                    SpaceWeight: {
                        value: self.spaceScoreWeight,
                        onChange: (v: any) => {
                            self.spaceScoreWeight = v;
                        },
                        min: 0,
                        max: 20.0,
                        step: 0.1,
                    },

                    filterActive: {
                        value: self.filterActive,
                        onChange: (v: boolean) => {
                            self.filterActive = v;
                        },
                    },
                    filterTime: {
                        value: self.filterTime,
                        onChange: (v: boolean) => {
                            self.filterTime = v;
                        },
                    },
                    filterSpace: {
                        value: self.filterSpace,
                        onChange: (v: boolean) => {
                            self.filterSpace = v;
                        },
                    },
                    showGUI: {
                        value: self.showGUI,
                        onChange: (v: boolean) => {
                            self.showGUI = v;
                        },
                    },
                    fixedFocalPlane: {
                        value: self.fixedFocalPlane,
                        onChange: (v: any) => {
                            self.fixedFocalPlane = v;
                        },
                    },
                },
                { collapsed: true }
            ),
            // ...super.getModelGUIControlSpec()
            // ...super.getControlPanelStandardSpec()
        };
    }


    static EVENTS = IBR_MODEL_EVENTS;
    // _targetSphere!:AMeshModel;
    static CONSTANTS = CONSTANTS;
    constructor() {
        super();
        // if(params){
        //     this._params = params;
        // }
        this.focusTargetPoint = V3(0, 0, 0);
        this.fixedFocalPlane = false;
        this.timeFilter = IBRDataModel.TimeFilters.Date;
        this.spaceFilter = IBRDataModel.SpaceFilters.Angle;
        this.filterOrder = IBR_FILTER_ORDER.ForTime_ST;
        this.timeInterpolationMode = IBR_TIME_INTERPOLATION_MODES.Neighborhood;
        // this.spaceInterpolationMode = IBR_SPACE_INTERPOLATION_MODES.Value;
        this.spaceInterpolationMode = IBR_SPACE_INTERPOLATION_MODES.Neighborhood;
        this.progressMode = IBR_PROGRESS_MODES.Order;
        this.nSpaceNeighbors = 3;
        this.showGUI = false;
        this.showFocusSphere = true;
        this.nSpaceNeighbors = 3;
        this.nTimeNeighbors = 30;
        this.timeAperture = 1.0;
        this.spaceAperture = 2.0;
        this.timeScoreWeight = 1.0;
        this.spaceScoreWeight = 1.0;
        this.filterTime = true;
        this.filterSpace = true;
        this.filterActive = true;

        this.setMaterial(IBRShaders.CreateMaterial(IBRShaders.ShaderNames.ViewReprojection));
        this.material.threejs.side=THREE.DoubleSide;

        const self = this;

        this.subscribe(
            this.addVirtualCameraListener(() => {
                self.updateReconstruction();
            }),
            "IBR Scene Model Virtual Camera"
        );
        this.subscribe(
            this.addFocusListener(() => {
                self.updateReconstruction();
            }),
            "IBR Scene Model focusTargetPoint"
        );

        this.subscribe(
            this.addStateKeyListener("timeFilter", () => {
                self.setTimeValues(self.sceneData.capturedImages, self.timeFilter);
                self._targetTimeValue =
                    self._neighborhoodViews[0]._currentTemporalSortValue;
            }),
            "timeFilter change update targetTimeValue"
        );
    }

    get focusDistance() {
        return this.focusTargetPoint.minus(this.virtualCameraPose.position).L2();
    }


    addVirtualCameraListener(
        callback: (self: AObject) => void,
        handle?: string,
        synchronous: boolean = true
    ) {
        return this.addStateKeyListener(
            "_virtualCamera",
            callback,
            handle,
            synchronous
        );
    }

    addFocusListener(
        callback: (self: AObject) => void,
        handle?: string,
        synchronous: boolean = true
    ) {
        return this.addStateKeyListener(
            "focusTargetPoint",
            callback,
            handle,
            synchronous
        );
    }

    get material(): ViewReprojectionShaderMaterial {
        return this._material as ViewReprojectionShaderMaterial;
    }

    setIBRScene(ibr: IBRSceneData) {
        this.sceneData = ibr;
        this.signalEvent(IBR_MODEL_EVENTS.IBR_SCENE_CHANGE);
    }

    setVirtualCamera(camera: ACamera) {
        this.sceneData.updateReconstructionScores(camera.pose, this.focusTargetPoint);
        this._virtualCamera = camera;
    }
    get virtualCamera() {
        return this._virtualCamera;
    }

    get virtualCameraPose() {
        return this.virtualCamera.pose;
    }

    get closestView() {
        if (this.filterActive) {
            let active = IBRCapturedImage.GetActive(this.sceneData.capturedImages);
            if (active.length) {
                return this.getSpaceSortedViews(active)[0];
            } else {
                return this.getSpaceSortedViews(this.sceneData.capturedImages)[0];
            }
        } else {
            return this.getSpaceSortedViews(this.sceneData.capturedImages)[0];
        }
    }

    shiftTargetTimeView(steps: number) {
        // let views = this._sortedViewsTime;
        let views = this.getTimeSortedViews(this.sceneData.capturedImages);
        for (let vi = 0; vi < views.length; vi++) {
            if (views[vi]._currentTemporalSortValue >= this._targetTimeValue) {
                let newind = Math.min(Math.max(vi + steps, 0), views.length - 1);
                this._targetTimeValue = views[newind]._currentTemporalSortValue;
                console.log(`NewIND: ${newind}`);
                // this.updateReconstruction();
                return;
            }
        }
    }

    setProgressByTimeOrder(progress: number, ordered?: IBRCapturedImage[]) {
        if (this.sceneData === undefined) {
            this._targetTimeValue = 0;
            return;
        }
        if (!ordered) {
            ordered = this.sceneData.capturedImages;
        }
        let pindex = progress * (ordered.length - 1);
        let find = Math.floor(pindex);
        let cind = Math.ceil(pindex);
        let alpha = pindex - find;
        let newt =
            alpha * ordered[cind]._currentTemporalSortValue +
            (1 - alpha) * ordered[find]._currentTemporalSortValue;
        this._targetTimeValue = newt;
    }

    setProgressByTimeValue(progress: number, ordered?: IBRCapturedImage[]) {
        if (this.sceneData === undefined) {
            this._targetTimeValue = 0;
            return;
        }
        if (!ordered) {
            ordered = this.sceneData.capturedImages;
        }
        let beginValue = ordered[0]._currentTemporalSortValue;
        let endValue = ordered[ordered.length - 1]._currentTemporalSortValue;
        this._targetTimeValue = endValue * progress + beginValue * (1.0 - progress);
    }

    setProgressByTime(progress: number) {
        let active = this.getActiveViews();
        this.setTimeValues(active);
        let timescored = IBRCapturedImage.GetSortedByTimeScore(active);
        switch (this.progressMode) {
            case IBRDataModel.ProgressModes.Order:
                this.setProgressByTimeOrder(progress, timescored);
                break;
            case IBRDataModel.ProgressModes.Value:
                this.setProgressByTimeValue(progress, timescored);
                break;
        }
        this.updateReconstruction();
    }

    getActiveViews() {
        let activeViews: IBRCapturedImage[];
        if (this.filterActive) {
            activeViews = IBRCapturedImage.GetActive(this.sceneData.capturedImages);
        } else {
            activeViews = this.sceneData.capturedImages.slice();
        }
        return activeViews;
    }

    _setTimeValuesToDate(views: IBRCapturedImage[]) {
        for (let v of views) {
            // v.setTemporalSortValue(IBRSceneModel.EvaluateTimeValueDate(v));
            v.setTemporalSortValue(v.captureTime.time);
        }
        // this.targetTimeValue=this.targetTimeStamp.time;
    }
    _setTimeValuesToTimeOfDay(views: IBRCapturedImage[]) {
        for (let v of views) {
            // v.setTemporalSortValue(IBRSceneModel.EvaluateTimeValueTimeOfDay(v));
            v.setTemporalSortValue(v.captureTime.getDaySeconds());
        }
        // this.targetTimeValue=this.targetTimeStamp.getDaySeconds();
    }

    // _getSortedByDate(views:IBRCapturedImage[], ref?:number){
    //     for(let v of views){
    //         v.setTemporalReconstructionScore(v.captureTime.time);
    //     }
    //     ref = ref??this.targetTimeStamp.time;
    //     return IBRCapturedImage.GetSortedByTimeScore(views, ref);
    // }

    _getSortedByPosition(views: IBRCapturedImage[], ref?: Vec3) {
        let refPosition = ref ?? V3();
        for (let v of views) {
            v.setSpatialSortValue(-1 * v.pose.position.minus(refPosition).L2());
        }
        return IBRCapturedImage.GetSortedBySpaceScore(views);
    }

    _getSortedByAngle(views: IBRCapturedImage[], ref?: Vec3, target?: Vec3) {
        let refPosition = ref ?? this.virtualCameraPose.position;
        let targetPoint = target ?? this.focusTargetPoint;
        for (let v of views) {
            let fv = v.pose.position.minus(targetPoint).getNormalized();
            let ft = refPosition.minus(targetPoint).getNormalized();
            v.setSpatialSortValue(fv.dot(ft));
        }
        return IBRCapturedImage.GetSortedBySpaceScore(views);
    }

    // _getSortedByTimeOfDay(views:IBRCapturedImage[], ref?:number){
    //     for(let v of views){
    //         v.setTemporalSortValue(v.captureTime.getDaySeconds());
    //     }
    //     return IBRCapturedImage.GetSortedByTimeScore(views, this.targetTimeStamp.getDaySeconds());
    // }
    //

    /**
     * Sort by temporal metric. Optionally filter by taking the first nViews of the sorted list.
     * Returns a copy of the list, does not modify the original.
     * @param views
     * @param temporal_filter
     * @param nViews
     * @returns {IBRCapturedImage[]}
     */
    getTimeSortedViews(
        views: IBRCapturedImage[],
        temporal_filter?: IBR_TEMPORAL_FILTERS,
        nViews?: number
    ) {
        let rviews: IBRCapturedImage[];
        this.setTimeValues(views, temporal_filter);
        rviews = IBRCapturedImage.GetSortedByTimeScore(
            views,
            this._targetTimeValue
        );
        if (nViews !== undefined && this.filterTime) {
            let nReturn = Math.min(nViews, views.length);
            return rviews.slice(0, nReturn);
        } else {
            return rviews;
        }
    }

    setTimeValues(
        views: IBRCapturedImage[],
        temporal_filter?: IBR_TEMPORAL_FILTERS
    ) {
        let timeFilter = temporal_filter ?? this.timeFilter;
        switch (timeFilter) {
            case IBRDataModel.TimeFilters.Date:
                // rviews = this._getSortedByDate(views);
                this._setTimeValuesToDate(views);
                break;
            case IBRDataModel.TimeFilters.TimeOfDay:
                // rviews = this._getSortedByTimeOfDay(views);
                this._setTimeValuesToTimeOfDay(views);
                break;
            case IBRDataModel.TimeFilters.SunAngle:
                // rviews = this._getSortedByTimeOfDay(views);
                this._setTimeValuesToTimeOfDay(views);
                break;
            default:
                this._setTimeValuesToDate(views);
                break;
        }
    }

    /**
     * Sort by spatial metric. Optionally filter by taking the first nViews of the sorted list.
     * Returns a copy of the list, does not modify the original.
     * @param {IBRCapturedImage[]} views
     * @param {IBR_SPATIAL_FILTERS} spatial_filter
     * @param {number} nViews
     * @returns {IBRCapturedImage[]}
     */
    getSpaceSortedViews(
        views: IBRCapturedImage[],
        spatial_filter?: IBR_SPATIAL_FILTERS,
        nViews?: number
    ) {
        let spaceFilter = spatial_filter ?? IBR_SPATIAL_FILTERS.Angle;
        let rviews: IBRCapturedImage[];
        switch (spaceFilter) {
            case IBRDataModel.SpaceFilters.Angle:
                rviews = this._getSortedByAngle(views);
                break;
            case IBRDataModel.SpaceFilters.Position:
                rviews = this._getSortedByPosition(views);
                break;
            default:
                rviews = views.slice();
                break;
        }
        if (nViews !== undefined && this.filterSpace) {
            let nReturn = Math.min(nViews, views.length);
            return rviews.slice(0, nReturn);
        } else {
            return rviews;
        }
    }

    updateReconstruction() {
        this.sceneData.resetContributionValues();
        if (this.sceneData === undefined) {
            return;
        }

        let activeViews: IBRCapturedImage[] = this.getActiveViews();
        // if(this.filterActive) {
        //     activeViews = IBRCapturedImage.GetActive(this.ibr.capturedImages);
        // }else{
        //     activeViews = this.ibr.capturedImages.slice();
        // }

        // let filteredViews:IBRCapturedImage[][]=[];
        let filteredViews: IBRCapturedImage[];
        // let timeSortedViews = this.getTimeSortedViews(activeViews, this.timeFilter);
        // let spaceSortedViews = this.getSpaceSortedViews(activeViews, this.spaceFilter);

        // defaults to spacetime
        switch (this.filterOrder) {
            case IBR_FILTER_ORDER.ForSpace_TS:
                filteredViews = this.getTimeSortedViews(
                    activeViews,
                    this.timeFilter,
                    this.nTimeNeighbors
                );
                this._neighborhoodViews = this.getSpaceSortedViews(
                    filteredViews,
                    this.spaceFilter,
                    this.nSpaceNeighbors
                );
                // filteredViews.push(this.getTimeSortedViews(activeViews, this.timeFilter, this.nTimeNeighbors));
                // filteredViews.push(this.getSpaceSortedViews(filteredViews[0], this.spaceFilter, this.nSpaceNeighbors))
                break;
            case IBR_FILTER_ORDER.ForTime_ST:
                filteredViews = this.getSpaceSortedViews(
                    activeViews,
                    this.spaceFilter,
                    this.nSpaceNeighbors
                );
                this._neighborhoodViews = this.getTimeSortedViews(
                    filteredViews,
                    this.timeFilter,
                    this.nTimeNeighbors
                );
                // filteredViews.push(this.getSpaceSortedViews(activeViews, this.spaceFilter, this.nSpaceNeighbors))
                // filteredViews.push(this.getTimeSortedViews(filteredViews[0], this.timeFilter, this.nTimeNeighbors))
                break;
            default:
                // filteredViews.push(activeViews);
                this._neighborhoodViews = activeViews;
                break;
        }

        // this._neighborhoodViews = filteredViews[filteredViews.length-1];
        if (this._neighborhoodViews.length > MAX_TEX_PER_CALL) {
            this._neighborhoodViews = this._neighborhoodViews.slice(
                0,
                MAX_TEX_PER_CALL
            );
        }
        let timeScores = new Vector();
        let spaceScores = new Vector();
        switch (this.timeInterpolationMode) {
            case IBRDataModel.TimeInterpolationModes.Value:
                for (let vi = 0; vi < this._neighborhoodViews.length; vi++) {
                    timeScores.elements.push(
                        this._neighborhoodViews[vi]._currentTemporalSortValue
                    );
                }
                break;
            case IBRDataModel.TimeInterpolationModes.Neighborhood:
                for (let vi = 0; vi < this._neighborhoodViews.length; vi++) {
                    timeScores.elements.push(gaussian(vi, this.timeAperture, 0));
                }
                break;
            default:
                timeScores.elements = Array(this._neighborhoodViews.length).fill(1.0);
        }

        switch (this.spaceInterpolationMode) {
            case IBRDataModel.SpaceInterpolationModes.Neighborhood:
                for (let vi = 0; vi < this._neighborhoodViews.length; vi++) {
                    spaceScores.elements.push(gaussian(vi, this.spaceAperture, 0));
                }
                break;
            case IBRDataModel.SpaceInterpolationModes.Value:
                for (let vi = 0; vi < this._neighborhoodViews.length; vi++) {
                    spaceScores.elements.push(
                        Math.pow(
                            this._neighborhoodViews[vi]._currentSpatialSortValue,
                            this.spaceAperture
                        )
                    );
                }
                break;
        }

        timeScores = timeScores
            .getNormalized()
            .getRaisedToPower(this.timeScoreWeight);
        spaceScores = spaceScores
            .getNormalized()
            .getRaisedToPower(this.spaceScoreWeight);
        let finalscores = spaceScores.timesElementWise(timeScores);
        let normFactor = 1.0 / finalscores.getSumOverElements();
        finalscores = finalscores.times(normFactor);

        for (let vi = 0; vi < this._neighborhoodViews.length; vi++) {
            this._neighborhoodViews[vi]._currentContributionToOutput =
                finalscores.elements[vi];
        }

        this.material.setCapturedImages(
            this._neighborhoodViews,
            finalscores.elements
            // Array(nims).fill(1.0/nims)
        );
        // this._sortedViewsTime = timeFiltered;
        // this._sortedViewsSpace = timeSpaceNeighbors;
    }

    wheelCallback(interaction: AWheelInteraction, event: AInteractionEvent) {
        let zoom = (event.DOMEvent as WheelEvent).deltaY;
        let focusDepth =
            this.focusDistance + zoom * CONSTANTS.FOCUS_DISTANCE_CHANGE_FACTOR;
        this.setFocusDistance(focusDepth);
    }

    shiftWheelCallback(interaction: AWheelInteraction, event: AInteractionEvent) {
        let zoom = (event.DOMEvent as WheelEvent).deltaX;
        console.log(zoom);
        if (zoom > 0) {
            this.shiftTargetTimeView(1);
        } else {
            this.shiftTargetTimeView(-1);
        }
    }

    setFocusDistance(d: number) {
        this.focusTargetPoint = this.virtualCameraPose.position.plus(
            this.focusTargetPoint
                .minus(this.virtualCameraPose.position)
                .getNormalized()
                .times(d)
        );
    }

    setFocusPlanePose(pose:NodeTransform3D){
        this.focusTargetPoint = pose.position;
        this._virtualCamera.setPosition(pose.position.plus(pose.getMatrix().c2.Point3D));
    }

    setFocusPlaneMatrix(mat:Mat4){
        this.focusTargetPoint = mat.c3.Point3D;
        this._virtualCamera.setPosition(this.focusTargetPoint.minus(mat.c2.Point3D.times(10)));
    }

    setFocusPointInImagePlane(focalPoint: Vec2) {
        let focusDistance = this.focusDistance;
        let screenTarget = focalPoint.times(2.0).minus(V2(1.0, 1.0));
        console.log(`[${screenTarget.x}, ${screenTarget.y}]`);
        console.log(`FP [${focalPoint.x}, ${focalPoint.y}]`);
        let fp4 = new Vec4(focalPoint.x, focalPoint.y, 1.0, 1.0);
        let fw = this.virtualCameraPose
            .getMatrix()
            .times(this.virtualCamera.projection.getInverse().times(fp4)).Point3D;
        let targetV = fw.minus(this.virtualCamera.position).getNormalized();
        // this.setFocusTargetPoint(this.camera.position.plus(targetV.times(focusDistance)));
        this.focusTargetPoint = this.virtualCamera.position.plus(
            targetV.times(focusDistance)
        );
    }
}
