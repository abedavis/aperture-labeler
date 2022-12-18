import os
from .AObject import AObject


# from afileui.fileui import *


def _pathstring(path):
    return path.replace(os.sep+os.sep, os.sep);

def _myisdir(fpath):
    return os.path.isdir(fpath);
    # fpparts = os.path.splitext(fpath);
    # return (fpparts[1] is '');

class HasFilePath(AObject):
    """

    """

    def __init__(self, path=None, **kwargs):
        # self._file_path = None;
        super(HasFilePath, self).__init__(**kwargs)
        if(path):
            adjusted_input_path = self._getAdjustedInputFilePath(input_file_path=path);
            # self._checkForPathChange(adjusted_input_path);
            self._setFilePath(file_path=adjusted_input_path, **kwargs);
            self._initAfterFilePathSet();


    def _getAdjustedInputFilePath(self, input_file_path):
        return input_file_path;

    # <editor-fold desc="Property: 'file_path'">
    @property
    def file_path(self):
        return self.getFilePath();
    def getFilePath(self):
        return self.getInfo('file_path');
    @file_path.setter
    def file_path(self, value):
        self._setFilePath(value);

    def _setFilePath(self, file_path=None, **kwargs):
        oldpath = self.file_path;  # wherever the filepath thought it was before. For example, it may be that this was the file path when something was previously saved, but it has been moved and is now being loaded from the new location.
        # fpparts = os.path.splitext(file_path);
        # assert(fpparts[1] is not ''), "file_path {} looks like a directory, not a file".format(file_path);
        assert(not _myisdir(file_path)), "file_path {} is a directory, not a file".format(file_path);
        # assert(not os.path.isdir(file_path)), "file_path {} is a directory, not a file".format(file_path);


        # self._file_path = file_path;
        self.setInfo('file_path', os.path.normpath(file_path));
        self.on_path_change(new_path=self.file_path, old_path=oldpath);
    # </editor-fold>

    def _initAfterFilePathSet(self):
        pass;

    # <editor-fold desc="Property: 'md5_string'">
    @property
    def _md5(self):
        if(self._md5_string is None):
            self._md5 = self._getFilePathMD5String();
        return self._md5_string;
    @property
    def _md5_string(self):
        return self.getInfo("md5_string");
    @_md5.setter
    def _md5(self, value):
        self._md5_string=value;
    @_md5_string.setter
    def _md5_string(self, value):
        self.setInfo('md5_string', value);
    # </editor-fold>



    # @property
    # def file_path(self):
    #     return self.getFilePath();
    @property
    def file_name(self):
        return self.getFileName()
    @property
    def file_name_base(self):
        return self.getFileNameBase()
    @property
    def file_ext(self):
        return self.getFileExtension();

    @property
    def absolute_file_path(self):
        return os.path.abspath(self.file_path)

    def withDifferentExtension(self, ext):
        current = self.file_path;
        return os.path.splitext(current)[0] + ext;


    def on_path_change(self, new_path=None, old_path=None, **kwargs):
        """
        Anything that should be done when _setFilePath changes the path.
        :param new_path:
        :param old_path:
        :param kwargs:
        :return:
        """
        self._md5 = None;
        return;

    def getFileName(self):
        filepath = self.file_path
        if (filepath is not None):
            return os.path.basename(self.file_path);

    def getParentDirName(self):
        return os.path.split(self.getDirectoryPath())[-1]

    def getFileExtension(self):
        filename = self.file_name
        if (filename is not None):
            name_parts = os.path.splitext(self.getFileName());
            return name_parts[1];

    def getFileNameBase(self):
        filename = self.file_name
        if (filename is not None):
            name_parts = os.path.splitext(self.getFileName());
            return name_parts[0];

    def getDirectoryPath(self):
        filepath = self.file_path
        if (filepath is not None):
            if(_myisdir(self.file_path)):
            # if (os.path.isdir(self.file_path)):
            #     assert (False), "file_path {} is a directory".format(self.file_path);
                return self.file_path;
            else:
                return os.path.dirname(self.file_path);

    def toDictionary(self):
        d = super(HasFilePath, self).toDictionary();
        # d.update(dict(file_path=self.file_path));
        return d;

    def initFromDictionary(self, d):
        super(HasFilePath, self).initFromDictionary(d);
        # self._file_path = d['file_path'];

    # def showInFinder(self):
    #     if(apy.defines.HAS_FILEUI):
    #         apy.afileui.Show(self.absolute_file_path);

    # def openFile(self):
    #     fileui.Open(self.file_path);

    # def _getFilePathMD5String(self):
    #     return hashlib.md5(self.file_path.encode('utf-8')).hexdigest();


# from abepy.apy.HasTags import HasTags

class FilePath(HasFilePath):
    def __init__(self, path=None, **kwargs):
        super(FilePath, self).__init__(path=path, **kwargs);
    def __str__(self):
        return self.file_path;
    def __repr__(self):
        return '[FilePath]:{}'.format(self.file_path);

    def getDirectoryPath(self):
        filepath = self.file_path
        if (filepath is not None):
            if (os.path.isdir(self.file_path)):
                return self.file_path;
            else:
                return os.path.dirname(self.file_path);

    def _setFilePath(self, file_path=None, **kwargs):
        oldpath = self.file_path;  # wherever the filepath thought it was before. For example, it may be that this was the file path when something was previously saved, but it has been moved and is now being loaded from the new location.
        self.setInfo('file_path', os.path.normpath(file_path));
        self.on_path_change(new_path=self.file_path, old_path=oldpath);

    def isFile(self):
        return os.path.isfile(self.file_path);

    def isDir(self):
        return os.path.isdir(self.file_path);

    def exists(self):
        return os.path.exists(self.file_path)

    @property
    def looks_like_dir(self):
        """
        whether the path looks like a directory. so 'a/b/c/' and 'a/b/c' both return true, but 'a/b/c.ext' returns false.
        :return:
        """
        if(self.file_path is None):
            return self.file_path;
        return (self.file_path == os.path.splitext(self.file_path)[0]);


    def relative(self, from_path=None):
        if(from_path is None):
            return os.path.relpath(self.file_path);
        else:
            return os.path.relpath(self.file_path, from_path);
