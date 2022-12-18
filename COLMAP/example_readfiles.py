from read_colmap import *

scene = COLMAPScene('../public/scenes/tests/turtle/foldermode/');

# scene.writeToJSON('../public/scenes/tests/turtle/foldermode/capturedata.json')

for im in scene.image_poses:
    print(im.name);
    print("Translation [xyz is -R^t * T]: {}".format(im.translation));
    print("Rotation [wxyz]: {}".format(im.rotation));
