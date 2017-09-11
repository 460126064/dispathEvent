var likai = function(selector) {
     return new likai.prototype.init(selector);
}
likai.prototype = {
    //重定向构造函数
    constructor: likai,
    queue:[],
    //初始化DOM节点
    init : function(selector){
        //如果没有选择器直接return this;
        if(!selector) return this;
        //暂不支持多DOM节点查找，后续会参考jquery源码对此处进行弥补
        if(typeof selector === 'string') {
             //类或者标签
             if((selector.charAt(0) === '.' || /^[a-z]+[1-6]{1}$/g.test(selector)) && selector.length > 1) {
                this.queue = document.querySelectorAll(selector);
             //id查询
             }else if(selector.charAt(0) === '#' && selector.length > 1) {
                this.queue = [document.querySelector(selector)];
             }else {
                return this;
             }
        }else {
            //传入一些错误值，likai(false) likai(null)
            return this;
        }

    },
    add:function(eventName,callback,capture) {
        //浏览器检测
        if(window.addEventListener) {
            this.queue.forEach(function(item){
                item.addEventListener(eventName,callback,capture);
                //判断当前元素是否应注册过事件，
                if(!item['evt' + eventName]) {
                  if(eventName.indexOf('mouse') > -1) {
                          //创建鼠标事件对象
                          var evt = document.createEvent('MouseEvents');
                          //初始化事件
                          evt.MouseEvent(eventName,capture || false,false);
                          //保存元素
                          item['evt' + eventName] = evt;
                          return;                                
                  }
                  //创建普通事件对象
                  var evt = document.createEvent('HTMLEvents');
                  //初始化事件
                  evt.initEvent(eventName,capture || false,false);
                  //保存元素
                  item['evt' + eventName] = evt;                              
                }

            })
        //IE独有事件
        }else if(window.attachEvent) {
            this.queue.forEach(function(item){
                //绑定事件
                item.attachEvent(on + eventName,callback);
                //IE无法自定义事件，另辟蹊径
                if(!item['likai' + eventName]) {
                        //自定义属性
                        item['likai' + eventName] = 0;
                }
                //注册触发属性事件
                var evt = function(e) {
                    e = e || window.e;
                    //触发属性改变的属性名称
                    if(e.propertyName === item['likai' + eventName]) {
                        callback.call(el,e);
                    }
                }
                item.attachEvent('onpropertychange',evt);
                //保存onpropertychange事件，可能会有多个,方便删除
                if(item['evt' + eventName]) {
                     item['evt' + eventName].push(evt);  
                }else {
                     item['evt' + eventName] = [evt];
                }
            })
        }
        return this;
    },
    //触发事件
    fire:function(eventName) {
        if(window.addEventListener) {
                this.queue.forEach(function(item) {
                        item.dispatchEvent(item['evt' + eventName])
                })
        }else if(window.attachEvent) {
                this.queue.forEach(function(item) {
                        item['likai' + eventName]++;
                })                        
        }
        return this;
    },
    //删除事件
    devareEns:function(eventName,callback,capture) {
        if(window.addEventListener) {
                this.queue.forEach(function(item) {
                        window.removeEventListener(eventName,callback,capture || false);
                })
        }else if(window.attachEvent) {
                this.queue.forEach(function(item) {
                        item.detachEvent(eventName,callback);
                        var evts = item['evt' + eventName];
                        if(Array.isArray(evts)){
                              item['evt' + eventName].forEach(function(i) {
                                 item.detachEvent('onpropertychange',evts[i]); 
                              })  
                        }
                })                        
        }
        return this;               
    }
}
//重定向原型
likai.prototype.init.prototype = likai.prototype;