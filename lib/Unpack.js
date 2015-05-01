var Utils=require("./Utils.js");
var decodeUTF8=Utils.DecodeUTF8;
function Unpack(buff,extHandlers){
  var data=new DataView(buff);
  var offset=0;
  
  function element(){
    var type=data.getUint8(offset++);
    switch(type){
      case 0xC0: //null
        return null;
      case 0xC2://boolean false
        return false;
      case 0xC3://boolean true
        return true;
      case 0xC4://bin 8
        var len=data.getUint8(offset++);
        return data.buffer.slice(offset,(offset+=len));
      case 0xC5://bin 16
        var len=data.getUint16((offset+=2)-2);
        return data.buffer.slice(offset,(offset+=len));
      case 0xC6://bin 32
        var len=data.getUint32((offset+=4)-4);
        return data.buffer.slice(offset,(offset+=len));
      case 0xC7:// ext 8
        var len=data.getUint8(offset++);
        var handler=extHandlers[data.getUint8(offset++)];
        var val=data.buffer.slice(offset,(offset+=len));
        return handler?handler(val):undefined;
      case 0xC8:// ext 16
        var len=data.getUint16((offset+=2)-2);
        var handler=extHandlers[data.getUint8(offset++)];
        var val=data.buffer.slice(offset,(offset+=len));
        return handler?handler(val):undefined;
      case 0xC9:// ext 32
        var len=data.getUint32((offset+=4)-4);
        var handler=extHandlers[data.getUint8(offset++)];
        var val=data.buffer.slice(offset,(offset+=len));
        return handler?handler(val):undefined;
        console.warn("ext is not implemented");
        return undefined;
      case 0xCA:// float 32
        return data.getFloat32((offset+=4)-4);
      case 0xCB:// float 64
        return data.getFloat64((offset+=8)-8);
      case 0xCC:// uint 8
        return data.getUint8(offset++);
      case 0xCD:// uint 16
        return data.getUint16((offset+=2)-2);
      case 0xCE:// uint 32
        return data.getUint32((offset+=4)-4);
      case 0xCF:// uint 64
        var HF=data.getUint32((offset+=4)-4);
        var LF=data.getUint32((offset+=4)-4);
        console.warn("Uint64 intergers are not supported by Javascript, interger will be mangled to a float64");
        return HF*4294967296+LF;;
      case 0xD0:// int 8
        return data.getInt8(offset++);
      case 0xD1:// int 16
        return data.getInt16((offset+=2)-2);
      case 0xD2:// int 32
        return data.getInt32((offset+=4)-4);
      case 0xD3:// int 64
        var HF=data.getInt32((offset+=4)-4);
        var LH=data.getInt32((offset+=4)-4);
        console.warn("Uint64 intergers are not supported by Javascript, interger will be mangled to a float64");
        return HF*2147483648+LH; //Looks to work but not quite shure
      case 0xD4:// fixext 1
        var handler=extHandlers[data.getUint8(offset++)];
        var val=data.buffer.slice(offset,++offset);
        return handler?handler(val):undefined;
      case 0xD5:// fixext 2
        var handler=extHandlers[data.getUint8(offset++)];
        var val=data.buffer.slice(offset,(offset+=2));
        return handler?handler(val):undefined;
      case 0xD6:// fixext 4
        var handler=extHandlers[data.getUint8(offset++)];
        var val=data.buffer.slice(offset,(offset+=4));
        return handler?handler(val):undefined;
      case 0xD7:// fixext 8
        var handler=extHandlers[data.getUint8(offset++)];
        var val=data.buffer.slice(offset,(offset+=8));
        return handler?handler(val):undefined;
      case 0xD8:// fixext 16
        var handler=extHandlers[data.getUint8(offset++)];
        var val=data.buffer.slice(offset,(offset+=16));
        return handler?handler(val):undefined;
      case 0xD9:// string 8
        var len=data.getUint8(offset++);
        return decodeUTF8(new Uint8Array(data.buffer.slice(offset,(offset+=len))));
      case 0xDA:// string 16
        var len=data.getUint16((offset+=2)-2);
        return decodeUTF8(new Uint8Array(data.buffer.slice(offset,(offset+=len))));
      case 0xDB:// string 32
        var len=data.getUint32((offset+=4)-4);
        return decodeUTF8(new Uint8Array(data.buffer.slice(offset,(offset+=len))));
      case 0xDC:
        var len=data.getUint16((offset+=2)-2);
        var ret=[];
        for(var i=0;i<len;i++)
          ret.push(element());
        return ret;
      case 0xDD:
        var len=data.getUint32((offset+=4)-4);
        var ret=[];
        for(var i=0;i<len;i++)
          ret.push(element());
        return ret;
      case 0xDE:
        var len=data.getUint16((offset+=2)-2);
        var ret={};
        for(var i=0;i<len;i++){
          var key=element();
          if(!(typeof key =='string'||typeof key =='number'))
            throw new Error("MessagePack.Unpack: Invalid key type for object");
          ret[key]=element();
        }
        return ret;
      case 0xDF:
        var len=data.getUint32((offset+=4)-4);
        var ret={};
        for(var i=0;i<len;i++){
          var key=element();
          if(!(typeof key =='string'||typeof key =='number'))
            throw new Error("MessagePack.Unpack: Invalid key type for object");
          ret[key]=element();
        }
        return ret;
      default:
        if(!(type&0x80)) // fixint
          return type;
        if((type&0xF0)==0x80){ //fixmap
          var len=type&0x0F;
          var ret={};
          for(var i=0;i<len;i++)
            ret[element()]=element();
          return ret;
        }
        if((type&0xF0)==0x90){ //fixarray
          var len=type&0x0F;
          var ret=[];
          for(var i=0;i<len;i++)
            ret.push(element());
          return ret;
        }
        if((type&0xE0)==0xA0){  //fixstr
          var len=type&0x1F;
          return decodeUTF8(new Uint8Array(data.buffer.slice(offset,(offset+=len))));
        }
        if(type>=0xE0&&type<=0xff) //fixint negative
          return -(type&0x1F);
    }
    throw new Error("MessagePack.Unpack: Malformed data stream");
  }

  return element();  
}

module.exports=Unpack;