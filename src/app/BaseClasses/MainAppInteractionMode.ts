import {ASerializable} from "../../anigraph";
import {ASceneInteractionMode} from "../../anigraph/scene/interactionmodes/ASceneInteractionMode";
import {MainSceneController} from "../main/Scene/MainSceneController";
import {BaseSceneController, BaseSceneModel} from "./index";
import {MainSceneModel} from "../main/Scene";

@ASerializable("MainAppInteractionMode")
export class MainAppInteractionMode extends ASceneInteractionMode {
    get owner(): MainSceneController {
        return this._owner as MainSceneController;
    }

    get model(): MainSceneModel {
        return this.owner.model;
    }


}
