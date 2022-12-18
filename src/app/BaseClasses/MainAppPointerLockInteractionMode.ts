import {AScenePointerLockInteractionMode} from "../../anigraph/scene/interactionmodes";
import {BaseSceneController} from "./BaseSceneController";
import {MainSceneController} from "../main/Scene";
import {BaseSceneModel} from "./BaseSceneModel";

export class MainAppPointerLockInteractionMode extends AScenePointerLockInteractionMode{
    get owner(): BaseSceneController {
        return this._owner as MainSceneController;
    }

    get model(): BaseSceneModel {
        return this.owner.model;
    }
}
