from apylite import *
import os
from datetime import datetime
import numpy as np

class ParseFile(object):
    def __init__(self, file_path):
        with open(os.path.join(file_path)) as f:
            self.lines = f.readlines();
        self.comment_lines = [];
        self.body_lines = [];
        for ln in self.lines:
            if(ln[0] == '#'):
                self.comment_lines.append(ln);
            else:
                self.body_lines.append(ln);

    def GetBodyGroups(self, lines_per_group):
        olist = [];
        for ln in range(len(self.body_lines)):
            if(ln%lines_per_group == 0):
                olist.append([]);
            olist[-1].append(self.body_lines[ln]);
        return olist;

class Camera(object):
    def __init__(self, lines):
        s0 = lines[0].split();
        self.id = s0[0];
        self.model = s0[1];
        self.width=int(s0[2]);
        self.height=int(s0[3]);
        self.params = np.array(s0[4:]).astype(np.float).tolist();



class ImagePose(object):
    def __init__(self, lines):
        s0 = lines[0].split();
        self.image_id = s0[0];
        self.rotation = np.array(s0[1:5]).astype(np.float).tolist();
        self.translation = np.array(s0[5:8]).astype(np.float).tolist();

        self.cameraID = s0[8];

        file_path = FilePath(' '.join(s0[9:]));
        self.filename = file_path.file_name;
        self.file_directory = file_path.getDirectoryPath();
        self.viewID = self.file_directory;
        self.file_path = file_path.file_path;
#         nameext = os.path.splitext(self.filename);
#         nameext = file_path.ext;
        self.name = file_path.file_name_base;
        self.ext = file_path.file_ext;
        done = False;
        try:
            dt = datetime.strptime(self.name,"%Y-%m-%d_%H:%M:%S");
            self.isotime=dt.isoformat();
            self.timestamp = dt.timestamp()
            self.weekday = dt.weekday();
            self.hour = dt.hour;
            self.year = dt.year;
            self.month = dt.month;
            self.minute = dt.minute;
            self.second = dt.second;
            self.day = dt.day;
            done = True;
        except:
            done = False;
        if(not done):
            try:
                dt = datetime.strptime(self.name,"%Y-%m-%d %H:%M:%S");
                self.isotime=dt.isoformat();
                self.timestamp = dt.timestamp()
                self.weekday = dt.weekday();
                self.hour = dt.hour;
                self.year = dt.year;
                self.month = dt.month;
                self.minute = dt.minute;
                self.second = dt.second;
                self.day = dt.day;
            except:
                try:
                    dt = datetime.strptime(self.name,"%Y-%m-%d__%H_%M_%S");
                    self.isotime=dt.isoformat();
                    self.timestamp = dt.timestamp()
                    self.weekday = dt.weekday();
                    self.hour = dt.hour;
                    self.year = dt.year;
                    self.month = dt.month;
                    self.minute = dt.minute;
                    self.second = dt.second;
                    self.day = dt.day;
                except:
                    self.isotime=self.image_id;
                    self.timestamp = self.image_id
                    self.weekday = self.image_id;
                    self.hour = self.image_id;
                    self.year = self.image_id;
                    self.month = self.image_id;
                    self.minute = self.image_id;
                    self.second = self.image_id;
                    self.day = self.image_id;




class COLMAPScene(SavesToJSON):
    def __init__(self, directory):
        super(COLMAPScene, self).__init__();
        self.images = [];
        imagefile = ParseFile(os.path.join(directory, 'images.txt'));
        self.image_poses = [];
        for i in imagefile.GetBodyGroups(2):
            self.image_poses.append(ImagePose(i))

        self.cameras = [];
        camerasfile = ParseFile(os.path.join(directory, 'cameras.txt'));
        self.cameras = [];
        for i in camerasfile.GetBodyGroups(1):
            self.cameras.append(Camera(i))

    # <editor-fold desc="Property: 'image_poses'">
    @property
    def image_poses(self):
        return self.getInfo("image_poses");
    @image_poses.setter
    def image_poses(self, value):
        self.setInfo('image_poses', value);
    # </editor-fold>

    # <editor-fold desc="Property: 'cameras'">
    @property
    def cameras(self):
        return self.getInfo("cameras");
    @cameras.setter
    def cameras(self, value):
        self.setInfo('cameras', value);
    # </editor-fold>

