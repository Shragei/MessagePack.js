var Utils={
  "DecodeUTF8":function decodeUTF8(data){
    var codepoints=[];
    for(var offset=0;offset<data.byteLength;){
      var part=data[offset++];
      var count=0;
      for(;(part<<(count))&0x80;count++)
        if(count==6) return undefined;
      
      var codepoint=part&(0xFF>>>(count));
      count--;
      for(var i=0;i<count;i++){
        var part=data[offset++];
        if((part&0xC0)!=0x80) return undefined;
        codepoint=(codepoint<<6)+(part&0x3F);
      }
      codepoints.push(codepoint)
    }
    var t=String.fromCharCode.apply(null,codepoints);
    return t;
  },
  "EncodeUTF8":function(value){
    var length=value.length;
    var utf8Buffer=new Uint8Array(length*4);
    var utf8BufferOffset=0;
    for(var i=0;i<length;i++){
      var codePoint=value.charCodeAt(i);
      if(codePoint<0x0080){
        utf8Buffer[utf8BufferOffset++]=codePoint;
      }else if(codePoint<0x0800){
        utf8Buffer[utf8BufferOffset++]=(codePoint>>6)&0x1F|0xC0;
        utf8Buffer[utf8BufferOffset++]=(codePoint&0x3F)|0x80;
      }else if(codePoint<0x10000){
        utf8Buffer[utf8BufferOffset++]=(codePoint>>12)|0xE0;
        utf8Buffer[utf8BufferOffset++]=((codePoint>>6)&0x3F)|0x80;
        utf8Buffer[utf8BufferOffset++]=(codePoint&0x3F)|0x80;
      }else if(codePoint<0x200000){
        utf8Buffer[utf8BufferOffset++]=(codePoint>>18)|0xF0;
        utf8Buffer[utf8BufferOffset++]=((codePoint>>12)&0x3F)|0x80;
        utf8Buffer[utf8BufferOffset++]=((codePoint>>6)&0x3F)|0x80;
        utf8Buffer[utf8BufferOffset++]=(codePoint&0x3F)|0x80;
      }else{
        return undefined;
      }
    }
    return utf8Buffer.buffer.slice(0,utf8BufferOffset);
  }
  
};
module.exports=Utils;