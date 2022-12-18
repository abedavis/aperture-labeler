# import jsonpickle


# SERIALIZABLE_VALUE_STRING = 'SerializableType'

class Serializable(object):
    def __init__(self, **kwargs):
        """
        ainfo is part of serialization
        binfo is not
        :param kwargs:
        """
        assert(not any(kwargs)), "unhandled keyword arguments {} for init on class {}".format(kwargs, self.__class__.__name__);
        # super(Serializable, self).__init__(**kwargs)
        self._ainfo = {};
        self._binfo = {};

    def __str__(self):
        return self._getAsDictionaryString();

    def setInfo(self, label, value):
        """

        :param label: label for the info being set
        :param value: value info is being set to
        :return:
        """
        # assert(label != SERIALIZABLE_AINFO_KEY_ID)
        self._ainfo[label]=value;

    def updateInfo(self, d):
        self._ainfo.update(d);

    def hasInfo(self, label):
        """

        :param label: label being checked
        :return:
        """
        return (label in self._ainfo);

    def getInfo(self, label):
        """

        :param label: label of info being retrieved
        :return: value of info with that label
        """
        return self._ainfo.get(label);

    def _setBInfo(self, label, value):
        self._binfo[label] = value;

    def _getBInfo(self, label):
        return self._binfo.get(label);

    def serializeInfo(self):
        """

        :return: the _ainfo dict,
        """
        return self._ainfo
        # rdict = dict(self._ainfo);
        # has_serializable = False;
        # for k in rdict:
        #     if(isinstance(k, Serializable)):
        #         rdict[k] = rdict[k].toDictionary();
        #         has_serializable = True;
        #         rdict[k][SERIALIZABLE_AINFO_KEY_ID] = SERIALIZABLE_AINFO_VALUE_ID;
        #
        # return rdict;
        # return dict(self._ainfo);
        # return jsonpickle.encode(self._ainfo);

    @staticmethod
    def DecodeInfo(d):
        return d;
        # rdict = dict(d);
        # # if (rdict[k].get(SERIALIZABLE_AINFO_KEY_ID) == SERIALIZABLE_AINFO_VALUE_ID):
        # for k in rdict:
        #     if(isinstance(rdict[k], dict)):
        #         if(rdict[k].get(SERIALIZABLE_AINFO_KEY_ID)==SERIALIZABLE_AINFO_VALUE_ID):
        #             rdict[k] = Serializable.CreateFromDictionary(rdict[k]);
        # return rdict;



    # def ToJSONPickleString(self):
    #     return jsonpickle.encode(self);

    # @staticmethod
    # def FromJSONPickleString(serialized):
    #     return jsonpickle.decode(serialized);


    def toDictionary(self):
        """
        :return:
        """
        if (hasattr(super(Serializable, self), 'toDictionary')):
            d = super(Serializable, self).toDictionary();
        else:
            d = {};
        d.update({'_ainfo': self.serializeInfo()});
        return d;


    def initFromDictionary(self, d):
        if(hasattr(super(Serializable, self), 'initFromDictionary')):
            super(Serializable, self).initFromDictionary(d);
        self._ainfo.update(Serializable.DecodeInfo(d.get('_ainfo')));

    def printAsDictionary(self):
        print(self._getAsDictionaryString());

    def _getAsDictionaryString(self):
        d = self.toDictionary();
        # print("{}:".format(self.AObjectTypeName()));

        def formatcontainer(d, tab=0):
            s = ['{\n']

            if isinstance(d, dict):
                for k, v in d.items():
                    if isinstance(v, (dict, list)):
                        v = formatcontainer(v, tab + 1)
                    else:
                        v = repr(v)

                    s.append('%s%r: %s,\n' % ('  ' * tab, k, v))
                s.append('%s}' % ('  ' * tab))
            elif(isinstance(d, list)):
                for v in d:
                    if(isinstance(v, (dict, list))):
                        v = formatcontainer(v, tab+1);
                    s.append('%s %s,\n' % ('  ' * tab, v))
                s.append('%s}' % ('  ' * tab))
            return ''.join(s)

        return formatcontainer(d);


    # def ToJSONPickleString(self):
    #     return jsonpickle.encode(self);
    #
    # @staticmethod
    # def FromJSONPickleString(serialized):
    #     return jsonpickle.decode(serialized);