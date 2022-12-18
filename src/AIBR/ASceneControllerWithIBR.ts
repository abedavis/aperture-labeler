import { ASceneController } from "src/anigraph";
import {ASceneModelWithIBR} from "./ASceneModelWithIBR";

export interface ASceneControllerWithIBR extends ASceneController{
    model:ASceneModelWithIBR;
}
