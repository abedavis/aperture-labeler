# import jsonpickle
import sys
import traceback
from .Serializable import Serializable as Serializable
import six

EXPANDED_AINFO_KEY_ID = "HasSerializableAInfo"
EXPANDED_AINFO_VALUE_ID = True;

# This is a dictionary of all registered AObject Classes
AObjectClasses = {};

def TestAObjects(verbose=False):
    if(verbose):
        print("Testing clone function for included AObjects...")
    for cname in AObjectClasses:
        try:
            cl = AObjectClasses[cname];
            testi1 = cl();
            testi2 = testi1.clone();
            if(verbose):
                print("AObject: {}".format(cname));

            # cl.AObjectTest(testi1);
            # cl.AObjectTest(testi2);
        except:
            e = sys.exc_info()[0];
            traceback.print_exc(file=sys.stdout)
            assert (False), "Failed trying to clone a {}.\nError: {}".format(cl, e);
        assert(testi2.AObjectTypeName() == cname), "Mismatch in AObject type name {} != {}".format(cname, testi2.AObjectTypeName());
        assert(type(testi2) == type(testi1) and type(testi2) == cl), "Class mismatch in AObject for class {}.".format(cl);

def register_serializable_class(cls_to_register):
    # print("Serializable class {} being registered".format(cls_to_register));
    assert(hasattr(cls_to_register, 'AObjectTypeName'));

    #TODO: This should probably be put back if you want to be safe
    # assert (AObjectClasses.get(cls_to_register.AObjectTypeName()) is None), "AObjectTypeName {} already used by {}\nold class: {}\nnew class: {}!".format(
    #     cls_to_register.AObjectTypeName(), cls_to_register.__name__, AObjectClasses.get(cls_to_register.AObjectTypeName()), cls_to_register);



    # assert(cls_to_register.AObjectTypeName() is not "SavesDirectories"), "First time insert SavesDirectories";
    AObjectClasses[cls_to_register.AObjectTypeName()] = cls_to_register;

    # try:
    #     cls_to_register();
    # except:
    #     e = sys.exc_info()[0];
    #     assert(False), "AObject classes must be instantiable without arguments (and loaded by initFromDictionary). Got exception {} when constructing class {}.".format(e, cls_to_register.AObjectTypeName());

class AObjectMeta(type):
    """
    Meta-class that is used to register AObject classes.
    """
    def __new__(cls, *args, **kwargs):
        # newtype = super(AObjectMeta, cls).__new__(cls);
        newtype = super(AObjectMeta, cls).__new__(cls, *args, **kwargs);
        register_serializable_class(newtype);
        return newtype;

    def __init__(cls, *args, **kwargs):
        super(AObjectMeta, cls).__init__(*args, **kwargs);
        # return super(AObjectMeta, cls).__init__(*args, **kwargs);


    def __call__(cls, *args, **kwargs):
        supercall = super(AObjectMeta, cls).__call__(*args, **kwargs);
        return supercall;

@six.add_metaclass(AObjectMeta)
class AObject(Serializable):
    """AObject Mixin - adds getInfo, setInfo, toDictionary and
    initFromDictionary

    This is a base mixin I use for a lot of my classes. The main things you need to implement in a subclass are toDictionary and initFromDictionary
    """
    # __metaclass__ = AObjectMeta; # replaced with six.add_metaclass for compatibility

    @classmethod
    def AObjectTypeName(cls):
        """
        If you have class name collisions (e.g. same name different module) you can specify the name to use in apy here.
        Ideally, you should use the longer version of the class name, e.g., 'abepy.AObject'.
        :return:
        """
        return cls.__name__;

    @staticmethod
    def _RegisteredAObjectClasses():
        """
        This only returns a copy of the dictionary, since only the metaclass should be able to edit the actual thing.
        :return:
        """
        return dict(AObjectClasses);

    @staticmethod
    def GetAObjectClass(serializable_type_name):
        s_class = AObject._RegisteredAObjectClasses().get(serializable_type_name);
        assert(s_class is not None), "Class with AObjectTypeName {} not registered. This probably means the module with this class has not been imported.".format(serializable_type_name);
        return s_class;


    def _AObjectTest(self):
        """
        This will be run by a new/blank member of that class in TestAObjects
        :return:
        """
        if (hasattr(super(AObject, self), '_AObjectTest')):
            super(AObject, self)._AObjectTest();


    def __init__(self, **kwargs):
        """

        :param kwargs:
        """
        super(AObject, self).__init__(**kwargs)
        self._ainfo['AObjectTypeName'] = self.AObjectTypeName();

    @staticmethod
    def Copy(to_copy):
        if(isinstance(to_copy, list)):
            olist = [];
            for o in to_copy:
                assert (isinstance(o, AObject)), "Trying to copy a {} instance using AObject Copy function".format(type(o));
                olist.append(o.clone());
            return olist;
        else:
            assert(isinstance(to_copy, AObject)), "Trying to copy a {} instance using the Copy function from AObject".format(type(to_copy));
            new_copy = to_copy.clone();
            return new_copy;

    @property
    def _selfclass(self):
        return type(self);

    def clone(self, share_data=False):
        """
        AObjects that are part of ainfo are shallow copied. It's easier to write the deep copy per class... trust me.
        :return:
        """
        selfclass = type(self);
        new_copy = selfclass();
        new_copy.initFromAObject(self, share_data=share_data);
        return new_copy;

    def initFromAObject(self, fromobject, share_data=False):
        """
        Need to check fromobject in case inheriting from multiple AObjects?
        :param fromobject:
        :return:
        """
        if (hasattr(super(AObject, self), 'initFromAObject')):
            super(AObject, self).initFromAObject(fromobject, share_data=share_data);
            print("super(AObject, self).initFromAObject exists -- why?")
        else:
            self.initFromDictionary(dict(fromobject.toDictionary()));

    @staticmethod
    def DictIsAObjectDictionary(d):
        a_info = d.get('_ainfo');
        if(a_info is not None and isinstance(a_info, dict)):
            if(a_info.get('AObjectTypeName') is not None):
                return True;

    @staticmethod
    def CreateFromDictionary(d):
        s_class = AObject.ClassFromDictionary(d);
        inst = s_class();
        inst.initFromDictionary(d=d);
        return inst;

    @staticmethod
    def ClassFromDictionary(d):
        a_info = d.get('_ainfo');
        assert (a_info), "Tried to create serializable from dictionary without _ainfo:\n{}".format(d);
        serializable_type_name = a_info.get('AObjectTypeName');
        assert (
        serializable_type_name), "Tried to load serializable from dictionary without AObjectTypeName:\n{}".format(
            d);
        return AObject.GetAObjectClass(serializable_type_name=serializable_type_name);


    def _getExpandedAInfo(self):
        rdict = dict(self._ainfo);
        for k in rdict:
            if(isinstance(rdict[k], Serializable)):
                rdict[k] = rdict[k]._getExpandedAInfo();
                rdict[k][EXPANDED_AINFO_KEY_ID] = EXPANDED_AINFO_VALUE_ID;

        return rdict;

    @staticmethod
    def DecodeExpandedAInfo(d):
        rdict = dict(d);
        for k in rdict:
            if(isinstance(rdict[k], dict)):
                if(rdict[k].get(EXPANDED_AINFO_KEY_ID)==EXPANDED_AINFO_VALUE_ID):
                    rdict[k] = Serializable.CreateFromDictionary(rdict[k]);
        return rdict;
