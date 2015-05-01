var Utils=require('./Utils.js');
var Handlers={};
Handlers.Unpack={
  0:function(data){ //Undefined
    return undefined;
  },
  1:function(data){ //Date
    var v=new DataView(data);
    var HF=v.getUint32(0);
    var LF=v.getUint32(4);
    var unitStamp=HF*4294967296+LF;;
    return new Date(unitStamp);
  },
  2:function(data){ //Regular expression
    var flagMask=(new Uint8Array(data))[0];
    var regex=Utils.DecodeUTF8(new Uint8Array(data.slice(1)));
    var flags='';
    if(flagMask&0x80)
      flags+='g';
    if(flagMask&0x40)
      flags+='i';
    if(flagMask&0x20)
      flags+='m';
    if(flagMask&0x10)
      flags+='y';
    return new RegExp(regex.replace(/\0*$/,''),flags);//The reqular expression has a chance to be null padded 
  }
};
Handlers.Pack={
  0:{
    obj:undefined,
    handler:function(){
      var a=new ArrayBuffer(1);//Need to return something      
      return a;
    }
  },
  1:{
    obj:Date,
    handler:function(data){
      var a=new ArrayBuffer(8);
      var d=new DataView(a);
      var timeStamp=data.valueOf();
      var HF=((timeStamp/4294967296))&0xFFFFFFFF;
      var LF=timeStamp-(4294967296*HF);
      d.setUint32(0,HF,false);
      d.setUint32(4,LF,false);
      return a;
    }
  },
  2:{
    obj:RegExp,
    handler:function(data){
      var flags=data.flags;
      var source=data.source;
      var flagMask=0;
      for(var i=0;i<flags.length;i++){
        var flag=flags[i];
        if(flag=='g')
          flagMask=flagMask|0x80;
        if(flag=='i')
          flagMask=flagMask|0x40;
        if(flag=='m')
          flagMask=flagMask|0x20;
        if(flag=='y')
          flagMask=flagMask|0x10;
      }
      source=Utils.EncodeUTF8(source);
      if(source===undefined)
        return undefined;
      
      var ret=new ArrayBuffer(source.byteLength+1);
      var Uint8=new Uint8Array(ret);
      Uint8[0]=flagMask;
      var t=new Uint8Array(source)
      Uint8.set(t,1);
      return ret;
    }
  }
};


module.exports=Handlers;