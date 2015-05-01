describe("Unpack",function(){
  describe("Null",function(){
    it("correctly unpacks null",function(){
      var known=new Uint8Array([0xC0]);
      expect(MessagePack.Unpack(known)).to.be.null;
    });
  });
  describe("Boolean",function(){
    it("correctly unpacks false Boolean",function(){
      var known=new Uint8Array([0xC2]);
      expect(MessagePack.Unpack(known)).to.be.false;
    });
    it("correctly unpacks true Boolean",function(){
      var known=new Uint8Array([0xC3]);
      expect(MessagePack.Unpack(known)).to.be.true;
    });
  });
  describe("Fixed unsigned int",function(){
    it("correctly unpacks fixed Uint",function(){
      var known=new Uint8Array([127]);
      expect(MessagePack.Unpack(known)).to.equal(127);
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
      it("correctly unpacks Uint"+(Math.pow(2,idx)*8),function(){
        var len=pack.data.length;
        var known=new Uint8Array(len);
        for(var j=0;j<len;j++){
          known[j]=pack.data[j];
        }
        expect(MessagePack.Unpack(known)).to.equal(pack.ret);
      }); 
    });
  });
  describe("Fixed signed int",function(){
    it("correctly unpacks fixed Int",function(){
      var known=new Uint8Array([0xFE]);
      expect(MessagePack.Unpack(known)).to.equal(-30);
    });
  });
  describe("Multi byte signed int",function(){
    var packs=[
         {data:[0xD0,0xEA],ret:-22},
         {data:[0xD1,0x80,0x00],ret:-32768},
         {data:[0xD2,0x80,0x00,0xA1,0xE1],ret:-2147442207},
         {data:[0xD3,0xff,0xff,0xff,0xfe,0xff,0xff,0xeb,0x60],ret:-4294972576}
        ];
    packs.forEach(function(pack,idx){
      it("correctly unpacks int"+(Math.pow(2,idx)*8),function(){
        var len=pack.data.length;
        var known=new Uint8Array(len);
        for(var j=0;j<len;j++){
          known[j]=pack.data[j];
        }
        expect(MessagePack.Unpack(known)).to.equal(pack.ret);
      }); 
    });
  });
  describe("Multi byte float",function(){
    it("correctly unpacks Float32",function(){
      var known=new Uint8Array([0xCA,0x3E,0x20,0x00,0x00]);
      expect(MessagePack.Unpack(known)).to.equal(0.15625);
    }); 
    it("correctly unpacks Float64",function(){
      var known=new Uint8Array([0xCB,0x7F,0xEF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]);
      expect(MessagePack.Unpack(known)).to.equal(1.7976931348623157e+308);
    }); 
  });
  describe("Fixed UTF8 string",function(){
    it("correctly unpacks fixed UTF8 string",function(){
      var known=new Uint8Array([0xBB,0x49,0xC3,0xB1,0x74,0xC3,0xAB,
                                0x72,0x6E,0xC3,0xA2,0x74,0x69,0xC3,
                                0xB4,0x6E,0xC3,0xA0,0x6C,0x69,0x7A,
                                0xC3,0xA6,0x74,0x69,0xC3,0xB8,0x6E]);
      expect(MessagePack.Unpack(known)).to.equal("Iñtërnâtiônàlizætiøn");
    });
  });
  describe("Multi Byte UTF8 string",function(){
    it("correctly unpacks uint8 len UTF8 string",function(){
      var known=new Uint8Array([0xD9,0x1B,0x49,0xC3,0xB1,0x74,0xC3,
                                0xAB,0x72,0x6E,0xC3,0xA2,0x74,0x69,
                                0xC3,0xB4,0x6E,0xC3,0xA0,0x6C,0x69,
                                0x7A,0xC3,0xA6,0x74,0x69,0xC3,0xB8,0x6E]);
      expect(MessagePack.Unpack(known)).to.equal("Iñtërnâtiônàlizætiøn");
    });
    it("correctly unpacks uint16 len UTF8 string",function(){
      var known=new Uint8Array([0xDA,0x00,0x1B,0x49,0xC3,0xB1,0x74,
                                0xC3,0xAB,0x72,0x6E,0xC3,0xA2,0x74,
                                0x69,0xC3,0xB4,0x6E,0xC3,0xA0,0x6C,0x69,
                                0x7A,0xC3,0xA6,0x74,0x69,0xC3,0xB8,0x6E]);
      expect(MessagePack.Unpack(known)).to.equal("Iñtërnâtiônàlizætiøn");
    });
    it("correctly unpacks uint32 len UTF8 string",function(){
      var known=new Uint8Array([0xDB,0x00,0x00,0x00,0x1B,0x49,0xC3,0xB1,
                                0x74,0xC3,0xAB,0x72,0x6E,0xC3,0xA2,0x74,
                                0x69,0xC3,0xB4,0x6E,0xC3,0xA0,0x6C,0x69,
                                0x7A,0xC3,0xA6,0x74,0x69,0xC3,0xB8,0x6E]);
      expect(MessagePack.Unpack(known)).to.equal("Iñtërnâtiônàlizætiøn");
    });
    it("correctly handles mangled UTF8 string",function(){
      var known=new Uint8Array([0xDB,0x00,0x00,0x00,0x1B,0x49,0xC3,0xB1,
                                0x74,0xC3,0xAB,0x72,0x6E,0xC3,0xA2,0x74,
                                0x69,0xC3,0xB4,0x6E,0xFF,0xA0,0x6C,0x69,
                                0x7A,0xC3,0xA6,0x74,0x69,0xC3,0xB8,0x6E]);
      expect(MessagePack.Unpack(known)).to.be.undefined;
    });
  });
  describe("Multi byte binary array",function(){
    it("correctly unpacks 8 bit length bin array",function(){
      var known=new Uint8Array([0xC4,0x05,0xDA,0xDA,0xDA,0xDA,0xDA]);
      var ret=MessagePack.Unpack(known);
      var uint8=new Uint8Array(ret);
      expect(uint8).to.deep.equal({0:0xDA,1:0xDA,2:0xDA,3:0xDA,4:0xDA});
    });
    it("correctly unpacks 16 bit length bin array",function(){
      var known=new Uint8Array([0xC5,0x00,0x05,0xDA,0xDA,0xDA,0xDA,0xDA]);
      var ret=MessagePack.Unpack(known);
      var uint8=new Uint8Array(ret);
      expect(uint8).to.deep.equal({0:0xDA,1:0xDA,2:0xDA,3:0xDA,4:0xDA});
    });
    it("correctly unpacks 32 bit length bin array",function(){
      var known=new Uint8Array([0xC6,0x00,0x00,0x00,0x05,0xDA,0xDA,0xDA,0xDA,0xDA]);
      var ret=MessagePack.Unpack(known);
      var uint8=new Uint8Array(ret);
      expect(uint8).to.deep.equal({0:0xDA,1:0xDA,2:0xDA,3:0xDA,4:0xDA});
    });
  });
  describe("Fixed array",function(){
    it("correctly unpacks fixed array",function(){
      var known=new Uint8Array([0x94,0xC0,0xCC,0xFF,0xCD,0xFF,0xE0,0xCE,0xFF,0xFF,0xA1,0xE1]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.include.members([null,255,65504,4294943201]);
    });
  });
  describe("Multi byte array",function(){
    it("correctly unpacks 16 bit length array",function(){
      var known=new Uint8Array([0xDC,0x00,0x04,0xC0,0xCC,0xFF,0xCD,0xFF,0xE0,0xCE,0xFF,0xFF,0xA1,0xE1]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.include.members([null,255,65504,4294943201]);
    });
    it("correctly unpacks 32 bit length array",function(){
      var known=new Uint8Array([0xDD,0x00,0x00,0x00,0x04,0xC0,0xCC,0xFF,0xCD,0xFF,0xE0,0xCE,0xFF,0xFF,0xA1,0xE1]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.include.members([null,255,65504,4294943201]);
    });
  });
  describe("Fixed map",function(){
    it("correctly unpacks fixed map",function(){
      var known=new Uint8Array([0x84,
                                0xa1,0x61,0x01,
                                0xa1,0x62,0x02,
                                0xa1,0x63,0x03,
                                0xa1,0x64,0x04]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.deep.equal({"a":1,"b":2,"c":3,"d":4});
    });
  });
  describe("Multi byte map",function(){
    it("correctly unpacks 16 bit length map",function(){
      var known=new Uint8Array([0xDE,0x00,0x04,
                                0xa1,0x61,0x01,
                                0xa1,0x62,0x02,
                                0xa1,0x63,0x03,
                                0xa1,0x64,0x04]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.deep.equal({"a":1,"b":2,"c":3,"d":4});
    });
    it("correctly unpacks 32 bit length map",function(){
      var known=new Uint8Array([0xDF,0x00,0x00,0x00,0x04,
                                0xa1,0x61,0x01,
                                0xa1,0x62,0x02,
                                0xa1,0x63,0x03,
                                0xa1,0x64,0x04]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.deep.equal({"a":1,"b":2,"c":3,"d":4});
    });
  });
  describe("Fixed ext",function(){
    it("correctly unpacks 1 byte fixed (undefined)",function(){
      var known=new Uint8Array([0xD4,0x00,0x00]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.be.undefined;
    });
    //TODO: create test for 2 byte fixed
    it("correctly unpacks 4 byte fixed (RegExp)",function(){
      var known=new Uint8Array([0xD6,0x02,0x80,0x61,0x2E,0x63]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.be.an.instanceof(RegExp);
      var flags=ret.toString().match(/[gimuy]*$/)[0];
      expect(flags).to.equal('g');
      expect(ret).to.have.property('source').that.equals('a.c');
    });
    it("correctly unpacks 8 byte fixed (Date)",function(){
      var known=new Uint8Array([0xD7,0x01,0x00,0x00,0x01,0x4c,0xdb,0xd9,0xe7,0xf8]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.be.an.instanceof(Date);
      expect(ret.toUTCString()).to.equal("Tue, 21 Apr 2015 12:00:33 GMT");
    });
    it("correctly unpacks 16 byte fixed (RegExp)",function(){
      var known=new Uint8Array([0xD8,0x02,0x80,0x5e,0x5b,0x20,
                                0x5c,0x74,0x5d,0x2b,0x7c,0x5b,
                                0x20,0x5c,0x74,0x5d,0x2b,0x24]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.be.an.instanceof(RegExp);
      var flags=ret.toString().match(/[gimuy]*$/)[0];
      expect(flags).to.equal('g');
      expect(ret).to.have.property('source').that.equals('^[ \\t]+|[ \\t]+$');
    });
  });
  describe("Multi byte ext",function(){
    it("correctly unpacks 8 bit length ext",function(){
      var known=new Uint8Array([0xC7,0x27,0x02,0x80,0x5c,0x62,0x5c,
                                0x64,0x7b,0x31,0x2c,0x33,0x7d,0x5c,
                                0x2e,0x5c,0x64,0x7b,0x31,0x2c,0x33,
                                0x7d,0x5c,0x2e,0x5c,0x64,0x7b,0x31,
                                0x2c,0x33,0x7d,0x5c,0x2e,0x5c,0x64,
                                0x7b,0x31,0x2c,0x33,0x7d,0x5c,0x62]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.be.an.instanceof(RegExp);
      var flags=ret.toString().match(/[gimuy]*$/)[0];
      expect(flags).to.equal('g');
      expect(ret).to.have.property('source').that.equals('\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b');
    });
    it("correctly unpacks 16 bit length ext",function(){
      var known=new Uint8Array([0xC8,0x00,0x27,0x02,0x80,0x5c,0x62,
                                0x5c,0x64,0x7b,0x31,0x2c,0x33,0x7d,
                                0x5c,0x2e,0x5c,0x64,0x7b,0x31,0x2c,
                                0x33,0x7d,0x5c,0x2e,0x5c,0x64,0x7b,
                                0x31,0x2c,0x33,0x7d,0x5c,0x2e,0x5c,
                                0x64,0x7b,0x31,0x2c,0x33,0x7d,0x5c,
                                0x62]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.be.an.instanceof(RegExp);
      var flags=ret.toString().match(/[gimuy]*$/)[0];
      expect(flags).to.equal('g');
      expect(ret).to.have.property('source').that.equals('\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b');
    });
    it("correctly unpacks 32 bit length ext",function(){
      var known=new Uint8Array([0xC9,0x00,0x00,0x00,0x27,0x02,0x80,
                                0x5c,0x62,0x5c,0x64,0x7b,0x31,0x2c,
                                0x33,0x7d,0x5c,0x2e,0x5c,0x64,0x7b,
                                0x31,0x2c,0x33,0x7d,0x5c,0x2e,0x5c,
                                0x64,0x7b,0x31,0x2c,0x33,0x7d,0x5c,
                                0x2e,0x5c,0x64,0x7b,0x31,0x2c,0x33,
                                0x7d,0x5c,0x62]);
      var ret=MessagePack.Unpack(known);
      expect(ret).to.be.an.instanceof(RegExp);
      var flags=ret.toString().match(/[gimuy]*$/)[0];
      expect(flags).to.equal('g');
      expect(ret).to.have.property('source').that.equals('\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b');
    });
  });
});
