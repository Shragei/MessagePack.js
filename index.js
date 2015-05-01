var Pack=require('./lib/Pack.js');
var Unpack=require('./lib/Unpack.js');
var Utils=require('./lib/Utils.js');
var ExtHandlers=require("./lib/ExtHandlers.js");

var handlers={"Unpack":{},"Pack":{}};

var MessagePack={
  "Utils":Utils,
  "Pack":function(obj){
    var workingHandlers={};
    var hKeys=Object.keys(handlers.Pack);
    for(var i=0;i<hKeys.length;i++)
      workingHandlers[hKeys[i]]=handlers.Unpack[hKeys[i]];
    
    if(MessagePack.UseDefaultHandlers){
      var ExtKeys=Object.keys(ExtHandlers.Pack);
      for(var i=0;i<ExtKeys.length;i++)
        workingHandlers[ExtKeys[i]]=ExtHandlers.Pack[ExtKeys[i]];
    }
    return Pack(obj,MessagePack.segmentSize,workingHandlers);
  },
  "Unpack":function(data){
    var workingHandlers={};
    var hKeys=Object.keys(handlers.Unpack);
    for(var i=0;i<hKeys.length;i++)
      workingHandlers[hKeys[i]]=handlers.Unpack[hKeys[i]];
    
    if(MessagePack.UseDefaultHandlers){
      var ExtKeys=Object.keys(ExtHandlers.Unpack);
      for(var i=0;i<ExtKeys.length;i++)
        workingHandlers[ExtKeys[i]]=ExtHandlers.Unpack[ExtKeys[i]];
    }
    
    if (data instanceof ArrayBuffer) {
      return Unpack(data,workingHandlers);
    }else{
      var typedArrays=[Int8Array,Uint8Array,Uint8ClampedArray,
                       Int16Array,Uint16Array,
                       Int32Array,Uint32Array,
                       Float32Array,Float64Array];
      for(var i=0;i<typedArrays.length;i++){
        if (data instanceof typedArrays[i]) {
          return Unpack(data.buffer,workingHandlers);
        }
      }
    
      throw new Error("MessagePack.Unpack: Expecting data as ArrayBuffer"); 
    }
  },
  "segmentSize":65536,
  "AddHandler":function(extPack,extUnpack){
    var ids=Object.keys(extPack);
    for(var i=0;i<ids;i++)
      handlers.Pack[ids[i]]=extPack[ids[i]];
    ids=Object.keys(extUnpack);
    for(var i=0;i<ids;i++)
      handlers.Unpack[ids[i]]=extUnpack[ids[i]];
  },
  "UseDefaultHandlers":true
};

global.MessagePack=MessagePack;