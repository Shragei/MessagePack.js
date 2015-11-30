var Utils=require('./Utils.js');

function Pack(rootObj,segmentSize,extHandlers){
  var segments=[];
  var segment=new Uint8Array(segmentSize);
  var type=new Uint8Array(1);
  var elementBuff=new ArrayBuffer(64);
  var Uint8=new Uint8Array(elementBuff);
  var view=new DataView(elementBuff);
  var offset=0;
  function copy(buff,len){
    if(len<=64){
      for(var i=0;i<len;i++){
        segment[offset++]=buff[i];
        if(offset==segmentSize){
          segments.push(segment);
          segment=new Uint8Array(segmentSize);
          offset=0;
        }
      }
    }else{
      if(len<(segmentSize-offset)){
        segment.set(new Uint8Array(buff.buffer.slice(0,len)),offset);
        offset+=len;
      }else{
        var t=(segmentSize-offset);
        len-=t;
        segment.set(buff.buffer.slice(0,t),offset);
        segments.push(segment);
        segment=new Uint8Array(segmentSize);
        segment.set(buff.buffer.slice(len),0);
        offset=len;
      }
    }
  }
  function storeExt(type,id,data,len) {
    Uint8[0]=type;
    Uint8[1]=id;
    copy(Uint8,2);
    copy(new Uint8Array(data),len);
  }
  function computeUInt(value,types){
    if(value<=255&&types[0]!==0){
      Uint8[0]=types[0];
      Uint8[1]=value;
      copy(Uint8,2);
    }else if(value<=65535){
      Uint8[0]=types[1];
      Uint8[1]=value>>>8;
      Uint8[2]=value&0xFF;
      copy(Uint8,3);
    }else if(value<=4294967295){
      Uint8[0]=types[2];
      Uint8[1]=(value>>>24)&0xFF;
      Uint8[2]=(value>>>16)&0xFF;
      Uint8[3]=(value>>>8)&0xFF;
      Uint8[4]=value&0xFF;
      copy(Uint8,5);
    }else if(types.length==4&&value<=9007199254740991){
      Uint8[0]=types[3];
      var HF=(value/4294967296)&0xFFFFFFFF;
      var LF=value-(4294967296*HF);
      Uint8[1]=(HF>>>24)&0xFF;
      Uint8[2]=(HF>>>16)&0xFF;
      Uint8[3]=(HF>>>8)&0xFF;
      Uint8[4]=HF&0xFF;
      Uint8[5]=(LF>>>24)&0xFF;
      Uint8[6]=(LF>>>16)&0xFF;
      Uint8[7]=(LF>>>8)&0xFF;
      Uint8[8]=LF&0xFF;
      copy(Uint8,9);
    }
  }
  
  function packBin(buff){
    var len=buff.byteLength;
    computeUInt(len,[0xC4,0xC5,0xC6])
    copy(new Uint8Array(buff),len);
  }
  
  function element(value){
    if(value===+value){// is number
      if(value%1==0&&value>=-9007199254740991&&value<=9007199254740991){// is interger
        if(value<0){// is negative interger
          if(value>=-31){
            Uint8[0]=((~value)+1)|0xE0;
            copy(Uint8,1);
          }else if(value>=-128){
            Uint8[0]=0xD0;
            Uint8[1]=value;
            copy(Uint8,2);
          }else if(value>=-32768){
            Uint8[0]=0xD1;
            Uint8[1]=value>>>8;
            Uint8[2]=value&0xFF;
            copy(Uint8,3);
          }else if(value>=-2147483648){
            Uint8[0]=0xD2;
            Uint8[1]=(value>>>24)&0xFF;
            Uint8[2]=(value>>>16)&0xFF;
            Uint8[3]=(value>>>8)&0xFF;
            Uint8[4]=value&0xFF;
            copy(Uint8,5);
          }else{
            Uint8[0]=0xD3;
            var HF=((value/4294967296)-1)&0xFFFFFFFF;//??????????
            var LF=value-(4294967296*HF);
            Uint8[1]=(HF>>>24)&0xFF;
            Uint8[2]=(HF>>>16)&0xFF;
            Uint8[3]=(HF>>>8)&0xFF;
            Uint8[4]=HF&0xFF;
            Uint8[5]=(LF>>>24)&0xFF;
            Uint8[6]=(LF>>>16)&0xFF;
            Uint8[7]=(LF>>>8)&0xFF;
            Uint8[8]=LF&0xFF;
            copy(Uint8,9);
          }
        }else{// is positive interger
          if(value<0x80){
            Uint8[0]=value;
            copy(Uint8,1);
          }else
            computeUInt(value,[0xcc,0xcd,0xce,0xcf]);
        }
      
      }else{// is float
        //TODO find a reliable way to check if number fits into a 32bit float 
        /*if(value<=3.40282347e+38&&value>=-3.40282347e+38){//eplison 1.175494351e-38
          Uint8[0]=0xCA;
          view.setFloat32(1,value,false);
          copy(Uint8,5);
        }else{*/
          Uint8[0]=0xCB;
          view.setFloat64(1,value,false);
          copy(Uint8,9);
        //}
      }
    }else if(value===!!value){// is boolean
      if(value)
        type[0]=0xc3;
      else
        type[0]=0xc2;
      copy(type,1);
    }else if(value===null){
      type[0]=0xc0;
      copy(type,1);
    }else if(typeof value === 'string'){// is string
      var ret=Utils.EncodeUTF8(value);
      var utf8Buffer=new Uint8Array(ret);
      var len=utf8Buffer.byteLength;
      if(len<=31){
        Uint8[0]=0xA0|(len&0x1F);
        copy(Uint8,1);
      }else
        computeUInt(len,[0xD9,0xDA,0xDB])
      copy(utf8Buffer,len);
    }else if(Array.isArray(value)){// is array
      var len=value.length;
      if (len<=0x0F) {
        Uint8[0]=0x90+len;
        copy(Uint8,1);
      }else
        computeUInt(len,[0,0xDC,0xDD]);
      for(var i=0;i<len;i++)
        element(rootObj[i]);
    }else if(value instanceof ArrayBuffer){// is binary
      packBin(value);
    }else if(value instanceof Object&&Object.getPrototypeOf(value)==Object.prototype){// is object
      var keys=Object.keys(value);
      var len=keys.length;
      if (len<=0x0F) {
        Uint8[0]=0x80+len;
        copy(Uint8,1);
      }else
        computeUInt(len,[0,0xDE,0xDF]);
      for(var i=0;i<len;i++){
        element(keys[i]);
        element(value[keys[i]]);
      }
    }else{
      for (var id in extHandlers) {
        if (value===extHandlers[id].obj||(extHandlers[id].obj instanceof Object && value instanceof extHandlers[id].obj)) {
          var ret=extHandlers[id].handler(value);
          var len=ret.byteLength;
          if(len<=1){
            Uint8[0]=0xD4;
            Uint8[1]=id;
            if(len)
              Uint8[2]=(new Uint8Array(ret))[0];
            else
              Uint8[2]=0;
            copy(Uint8,3);
          }else if(len==2){
            storeExt(0xD5,id,ret,len);
          }else if(len==4){
            storeExt(0xD6,id,ret,len);
          }else if(len==8){
            storeExt(0xD7,id,ret,len);
          }else if(len==16){
            storeExt(0xD8,id,ret,len);
          }else{
            computeUInt(len,[0xC7,0xC8,0xC9])
          }
          break;
        }
      }
      
    }
  }
  
  element(rootObj);
  
  if(offset<segmentSize&&segments.length==0)
    return segment.buffer.slice(0,offset);
  
  var total=offset;
  for(var i=0;i<segments.length;i++)
    total+=segments[i].byteLength;
  
  var ret=new ArrayBuffer(total);
  for(var i=0;i<segments.length;i++)
    ret.set(segments[i],segmentSize*i);
  ret.set(segment.slice(0,offset),segments.length*segmentSize);
  return ret;
}

module.exports=Pack;