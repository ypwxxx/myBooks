const CCGlobal = require('CCGlobal');
const CCComFun = require('CCComFun');
const CCConst = require('CCConst');

const countTime = 20;       //轮转计时,单位:秒

var moreGameMod = {
    iconList: [],       //保存更多游戏图标的数组
    moreGameIcon: -1,    //更多游戏图标的序号标记
    touchOnce: false,        //设置按钮响应开关
    count: 1,
    gameKingId: 'wx7e367643a9a43769',       //游戏王者ID
    gameCenterId: 'wx00ce7bc1a37db415',     //游戏中心ID
    gameTianLiId: 'wx229335ef44989b15',        //天梨游戏盒子ID
    gameKingUrl: 'http://weixin.gzfingertip.cn/wegame/qrConfig/king.jpg',
    gameCenterUrl: 'http://weixin.gzfingertip.cn/wegame/qrConfig/youxizx.jpg',
    gameTianLiUrl: 'http://weixin.gzfingertip.cn/wegame/qrConfig/tianli.jpg',
    king: 1,
    center: 2,
    tianLi: 3,
    iconNode: null,             
    changeTime: countTime,

    /**
     * 从服务器获取更多游戏的图标,同时需要绑定一个节点,类似于初始化,成功调用一次即可
     * @param {cc.Node} node 需要绑定点击试玩功能的按钮
     */
    init: function(node){
        if(!node){
            cc.warn('更多游戏模块中从服务器获取图标的函数需要一个节点作为参数！');
            return;
        }
        let that = this;
        this.iconNode = node;
        if(CCGlobal.apiVer > '2.0.2'){
            if(this.iconList.length === 0){
                CCComFun.getWxServConfig({
                    appId: G.appId,
                    success: res => {
                        if (res.cfg != undefined && res.cfg.QRCodes != undefined) {
                            var obj = JSON.parse(res.cfg.QRCodes);    //转换成对象   
                            this.iconList.length = 0;
                            for (let k in obj) {
                                if (obj.hasOwnProperty(k)) {
                                    this.iconList.push(obj[k].iconUrl);     //iconList存储的为图片的url
                                }
                            }
                            that._changeMoreGameBtnIcon();
                        }
                    },
                    fail: res => {
                        console.log('后去配置错误');
                    }
                });
                setInterval(this._countDown.bind(this),1000);
            }else{
                this._changeMoreGameBtnIcon();
            }
        }
    },

    _countDown: function(){
        if(this.changeTime === 0 && this.iconNode){
            this._changeMoreGameBtnIcon();
            this.changeTime = countTime;
        }
        this.changeTime--;
    },

    //改变更多游戏按钮的图标的索引
    _changeMoreGameBtnIcon: function(){
        this.changeTime = countTime;
        if (this.moreGameIcon == -1) {
            this.moreGameIcon = Math.round(Math.random() * (this.iconList.length - 1));
        } else {            
            this.moreGameIcon = (Math.round(Math.random() * Math.ceil(this.iconList.length/2)) + this.moreGameIcon + 1) % this.iconList.length;
        }
        this._changeIcon();
    },

    //更换图标
    _changeIcon: function(){
        if(this.iconNode.name === "") return;
        let that = this;
        var remoteUrl = this.iconList[this.moreGameIcon];
        cc.loader.load(remoteUrl, function (err, texture) {
            that.iconNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        });
    },

    /**
     * 更多游戏按钮,跳转小程序
     * @param {number} num 输入1/2/3或者MoreGame.king,MoreGame.center,MoreGame.tianLi分别代表三种类型小程序
     */
    clickToMiniProgram : function(num){
        if(this.touchOnce) return;
        let id = null;
        let url = null;
        if(num === this.king){
            id = this.gameKingId;
            url = this.gameKingUrl;
        }else if(num === this.center){
            id = this.gameCenterId;
            url = this.gameCenterUrl;
        }else if(num === this.tianLi){
            id = this.gameTianLiId;
            url = this.gameTianLiUrl;
        }else{
            id = this.gameKingId;
            url = this.gameKingUrl;
        }
        if(CCGlobal.platform == CCConst.PLATFORM.WEIXIN && CCGlobal.apiVer > '1.9.97'){
            if(CCGlobal.apiVer >= '2.2.0' && CCGlobal.version >='6.7.1'){
                wx.navigateToMiniProgram({
                    appId: id,
                    path: null,
                    extraData: {},
                    success: function(){
                        console.log('成功转到小程序');
                    },
                    fail: function(err){
                        console.log('转到小程序失败',err);
                    },
                })
            }else if(CCGlobal.apiVer > '1.9.97' && CCGlobal.version >='6.6.2'){
                CCComFun.getWxServConfig({
                    appId: G.appId,
                    success: res => {
                        var obj = url;
                        var imglist = [];
                        imglist.push(obj);
                        wx.previewImage({
                            current: imglist[0],
                            urls: imglist
                        })
                    },
                    fail: res => {
                        console.log('获取配置失败');
                    }
                });
            }
        }
        this.touchOnce = true;
        setTimeout(() => {
            this.touchOnce = false;
        },500);
    },

    /**
     * 带有动画效果的更多游戏按钮/点击试玩功能
     * @param {number} num 输入1/2/3或者MoreGame.king,MoreGame.center,MoreGame.tianLi分别代表三种类型小程序
     */
    clickToDemoGame: function(num){
        this.count = 1;
        let id = null;
        if(num === this.king){
            id = this.gameKingId;
        }else if(num === this.center){
            id = this.gameCenterId;
        }else if(num === this.tianli){
            id = this.gameTianLiId;
        }else{
            id = this.gameKingId;
        }
        var self = this;
        //拿APP的配置
        if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN && CCGlobal.apiVer > '1.9.97') {
            if(CCGlobal.apiVer >= '2.2.0' && CCGlobal.version >='6.7.1'){
                wx.navigateToMiniProgram({
                    appId: id,
                    path: null,
                    extraData: {},
                    success: function(){
                        console.log('成功转到小程序');
                    },
                    fail: function(err){
                        console.log('转到小程序失败',err);
                    },
                })
            }else if (CCGlobal.apiVer > "2.0.9") {
                if(this.iconNode.name === "") return;
                CCComFun.getWxServConfig({
                    appId: G.appId,
                    success: res => {
                        console.log(res);
                        if (res.cfg != undefined && res.cfg.QRCodes != undefined) {
                            var obj = JSON.parse(res.cfg.QRCodes);    //转换成对象
                            var imglist = [];
                            imglist.push(obj[this.moreGameIcon].url);
                            if (self.count == 1) {
                                wx.previewImage({
                                    current: imglist[0],
                                    urls: imglist
                                })
                                self.count = 0;
                                self._changeMoreGameBtnIcon();
                            }
                        }
                    },
                    fail: res => {
                        console.log("获取配置失败");
                    }
                })
            }
        }
    },

    /**
     * 设置游戏图标按钮的节点,调用之后会同时更换该节点的spriteframe
     * @param {cc.Node} node 需要绑定点击试玩功能的按钮节点
     */
    setIconNode: function(node){
        this.iconNode = node;
        this._changeIcon();
    },
}

module.exports = moreGameMod;