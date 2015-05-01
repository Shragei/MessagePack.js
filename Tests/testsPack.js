describe("Pack",function(){
  describe("Null",function(){
    it("correctly packs null",function(){
      var known=null;
      var test=new Uint8Array([0xC0]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
  });
  describe("Boolean",function(){
    it("correctly packs false Boolean",function(){
      var known=false;
      var test=new Uint8Array([0xC2]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
    it("correctly packs true Boolean",function(){
      var known=true;
      var test=new Uint8Array([0xC3]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
  });
  describe("Fixed unsigned int",function(){
    it("correctly packs fixed Uint",function(){
      var known=127;
      var test=new Uint8Array([127]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
  });
  describe("Multi byte unsigned int",function(){
    var packs=[
         {data:[0xCC,255],ret:255},
         {data:[0xCD,0xFF,0xE0],ret:65504},
         {data:[0xCE,0xFF,0xFF,0xA1,0xE1],ret:4294943201},
         {data:[0xCF,0x00,0x1f,0xff,0xff,0xff,0xff,0xff,0xff],ret:9007199254740991},
        ];
    packs.forEach(function(pack,idx){
      it("correctly packs Uint"+(Math.pow(2,idx)*8),function(){
        var len=pack.data.length;
        var known=pack.ret;
        var test=new Uint8Array(len);
        for(var j=0;j<len;j++){
          test[j]=pack.data[j];
        }
        var ret=MessagePack.Pack(known);
        expect(ret).to.be.an.instanceof(ArrayBuffer);
        expect(new Uint8Array(ret)).to.deep.equal(test);
      }); 
    });
  });
  describe("Fixed signed int",function(){
    it("correctly packs fixed Int",function(){
      var known=-30;
      var test=new Uint8Array([0xFE]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
  });
  describe("Multi byte signed int",function(){
    var packs=[
         {data:[0xD0,0xD5],ret:-43},
         {data:[0xD1,0x80,0x00],ret:-32768},
         {data:[0xD2,0x80,0x00,0xA1,0xE1],ret:-2147442207},
         {data:[0xD3,0xff,0xff,0xff,0xfe,0xff,0xff,0xeb,0x60],ret:-4294972576}
        ];
    packs.forEach(function(pack,idx){
      it("correctly packs int"+(Math.pow(2,idx)*8),function(){
        var len=pack.data.length;
        var known=pack.ret
        var test=new Uint8Array(len);
        for(var j=0;j<len;j++){
          test[j]=pack.data[j];
        }
        var ret=MessagePack.Pack(known);
        expect(ret).to.be.an.instanceof(ArrayBuffer);
        expect(new Uint8Array(ret)).to.deep.equal(test);
      }); 
    });
  });
  describe("Multi byte float",function(){
    it("correctly packs Float64",function(){
      var known=1.7976931348623157e+308;
      var test=new Uint8Array([0xCB,0x7F,0xEF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    }); 
  });
  describe("Fixed UTF8 string",function(){
    it("correctly unpacks fixed UTF8 string",function(){
      var known="Iñtërnâtiônàlizætiøn";
      var test=new Uint8Array([0xBB,0x49,0xC3,0xB1,0x74,0xC3,0xAB,
                               0x72,0x6E,0xC3,0xA2,0x74,0x69,0xC3,
                               0xB4,0x6E,0xC3,0xA0,0x6C,0x69,0x7A,
                               0xC3,0xA6,0x74,0x69,0xC3,0xB8,0x6E]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
  });
  describe("Multi Byte UTF8 string",function(){
    it("correctly packs uint8 len UTF8 string",function(){
      var known="いろはにほへど　ちりぬるを わがよたれぞ　つねならむ うゐのおくやま　けふこえて あさきゆめみじ　ゑひもせず";
      var test=new Uint8Array([0xD9,0x9C,0xE3,0x81,0x84,0xE3,0x82,0x8D,0xE3,0x81,0xAF,0xE3,0x81,0xAB,0xE3,
                               0x81,0xBB,0xE3,0x81,0xB8,0xE3,0x81,0xA9,0xE3,0x80,0x80,0xE3,0x81,0xA1,0xE3,
                               0x82,0x8A,0xE3,0x81,0xAC,0xE3,0x82,0x8B,0xE3,0x82,0x92,0x20,0xE3,0x82,0x8F,
                               0xE3,0x81,0x8C,0xE3,0x82,0x88,0xE3,0x81,0x9F,0xE3,0x82,0x8C,0xE3,0x81,0x9E,
                               0xE3,0x80,0x80,0xE3,0x81,0xA4,0xE3,0x81,0xAD,0xE3,0x81,0xAA,0xE3,0x82,0x89,
                               0xE3,0x82,0x80,0x20,0xE3,0x81,0x86,0xE3,0x82,0x90,0xE3,0x81,0xAE,0xE3,0x81,
                               0x8A,0xE3,0x81,0x8F,0xE3,0x82,0x84,0xE3,0x81,0xBE,0xE3,0x80,0x80,0xE3,0x81,
                               0x91,0xE3,0x81,0xB5,0xE3,0x81,0x93,0xE3,0x81,0x88,0xE3,0x81,0xA6,0x20,0xE3,
                               0x81,0x82,0xE3,0x81,0x95,0xE3,0x81,0x8D,0xE3,0x82,0x86,0xE3,0x82,0x81,0xE3,
                               0x81,0xBF,0xE3,0x81,0x98,0xE3,0x80,0x80,0xE3,0x82,0x91,0xE3,0x81,0xB2,0xE3,
                               0x82,0x82,0xE3,0x81,0x9B,0xE3,0x81,0x9A]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
    //Note: Other UTF8 tests are excluded because of data requirements.
  });
  describe("Multi byte binary array",function(){
    it("correctly packs 8 bit length bin array",function(){
      var known=new Uint8Array([0xDA,0xDA,0xDA,0xDA,0xDA]);
      var test=new Uint8Array([0xC4,0x05,0xDA,0xDA,0xDA,0xDA,0xDA]);
      var ret=MessagePack.Pack(known.buffer);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
    //Note: Other Bin tests are excluded because of data requirements.
  });
  describe("Fixed array",function(){
    it("correctly packs fixed array",function(){
      var known=[null,255,65504,4294943201];
      var test=new Uint8Array([0x94,0xC0,0xCC,0xFF,0xCD,0xFF,0xE0,0xCE,0xFF,0xFF,0xA1,0xE1]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
  });
  describe("Multi byte array",function(){
    it("correctly packs 16 bit length array",function(){
      var known=[null,255,65504,4294943201,null,255,65504,4294943201,
                 null,255,65504,4294943201,null,255,65504,4294943201];
      var test=new Uint8Array([0xDC,0x00,0x10,
                               0xC0,0xCC,0xFF,0xCD,0xFF,0xE0,0xCE,0xFF,0xFF,0xA1,0xE1,
                               0xC0,0xCC,0xFF,0xCD,0xFF,0xE0,0xCE,0xFF,0xFF,0xA1,0xE1,
                               0xC0,0xCC,0xFF,0xCD,0xFF,0xE0,0xCE,0xFF,0xFF,0xA1,0xE1,
                               0xC0,0xCC,0xFF,0xCD,0xFF,0xE0,0xCE,0xFF,0xFF,0xA1,0xE1]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
    //Note: Other Array tests are excluded because of data requirements.
  });
  describe("Fixed map",function(){
    it("correctly packs fixed map",function(){
      var known={"a":1,"b":2,"c":3,"d":4};
      var test=new Uint8Array([0x84,
                                0xa1,0x61,0x01,
                                0xa1,0x62,0x02,
                                0xa1,0x63,0x03,
                                0xa1,0x64,0x04]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
  });
  describe("Multi byte map",function(){
    it("correctly packs 16 bit length map",function(){
      var known={"a":1,"b":2,"c":3,"d":4,"e":5,"f":6,"g":7,"h":8,
                 "j":9,"k":10,"l":11,"m":12,"n":13,"o":14,"p":15,"q":16};
      var test=new Uint8Array([0xde,0x00,0x10,
                               0xa1,0x61,0x01,0xa1,0x62,0x02,0xa1,0x63,0x03,
                               0xa1,0x64,0x04,0xa1,0x65,0x05,0xa1,0x66,0x06,
                               0xa1,0x67,0x07,0xa1,0x68,0x08,0xa1,0x6a,0x09,
                               0xa1,0x6b,0x0a,0xa1,0x6c,0x0b,0xa1,0x6d,0x0c,
                               0xa1,0x6e,0x0d,0xa1,0x6f,0x0e,0xa1,0x70,0x0f,
                               0xa1,0x71,0x10]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
    //Note: Other Map tests are excluded because of data requirements.
  });
  describe("Fixed ext",function(){
    it("correctly packs 1 byte fixed (undefined)",function(){
      var known=undefined
      var test=new Uint8Array([0xD4,0x00,0x00]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
    it("correctly packs 4 byte fixed (RegExp)",function(){
      var known=new RegExp("a.c",'g')
      var test=new Uint8Array([0xD6,0x02,0x80,0x61,0x2E,0x63]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
    it("correctly packs 8 byte fixed (Date)",function(){
      var known=new Date("Tue, 21 Apr 2015 12:00:33 GMT");
      var test=new Uint8Array([0xD7,0x01,0x00,0x00,0x01,0x4c,0xdb,0xd9,0xe6,0xe8]);
      var ret=MessagePack.Pack(known);
      expect(ret).to.be.an.instanceof(ArrayBuffer);
      expect(new Uint8Array(ret)).to.deep.equal(test);
    });
  });
});