"use strict";

var kitItem = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;//名称
        this.place = obj.place;//地址
        this.topic = obj.topic;//攻略题目
        this.hotel = obj.hotel;//入住酒店
		this.image = obj.image;//图片
		this.fee = obj.fee;//费用
		this.days = obj.days;//费用
		this.kit_text = obj.kit_text;//攻略正文
		this.time = obj.time;//记录时间
		this.likeNum = obj.likeNum;//点赞数
		this.commNum = obj.commNum;//评论数
        this.from = obj.from;
	} else {
	    this.name = "";
        this.place = "";
        this.topic = "";
        this.hotel="";
		this.image="";
		this.fee="";
		this.days="";
		this.kit_text="";
		this.time ="";
		this.likeNum =0;
		this.commNum =0;
		this.from = "";
	}
};
var CommentItem = function(text) {//评论
	if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;//id=from+'_'+时间戳
        this.kitKey = obj.kitKey;
        this.content = obj.content;
        this.commentTime = obj.commentTime;
        this.from = obj.from;
        this.commentKey = obj.commentKey;
	} else {
        this.id = "";
        this.kitKey = "";
        this.content = "";
        this.commentTime = "";
        this.from = "";
        this.commentKey = "";
	}
};
var GoodItem = function(text) {//点赞记录信息
	if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;//id=from+'_'+时间戳
        this.kitKey = obj.kitKey;
        this.number = obj.number;
        this.recordTime = obj.recordTime;
        this.from = obj.from;
	} else {
        this.id = "";
        this.kitKey = "";
        this.number = 0;
        this.recordTime = "";
        this.from = "";
	}
};



CommentItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
GoodItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

kitItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var kitSys = function() {
    // 1. 先创建GoldSunStorage对象（用于存储数据）
    var goldApi = new GoldSunStorage(null);
    // 2. 定义数据结构，该行代码作用：为ApiSample创建一个属性sample_data，该属性是一个list结构，list中存储的是SampleDataItem对象
    goldApi.defineMapProperty(this, "kit_list", {
        parse: function (text) {
            return new kitItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    goldApi.defineProperty(this, "kit_list_size");
    // 定义一个存储string的list
    goldApi.defineMapProperty(this, "kit_list_array");

	 //评论列表
    goldApi.defineMapProperty(this, "commentItem_list", {
        parse: function (text) {
            return new CommentItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    // 定义一个参数，记录commentItem_list的长度
    goldApi.defineProperty(this, "commentItem_list_size");
    // 定义一个存储string的list
    goldApi.defineMapProperty(this, "commentItem_list_array");
	
	
    //点赞列表
    goldApi.defineMapProperty(this, "goodItem_list", {
        parse: function (text) {
            return new GoodItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    // 定义一个参数，记录goodItem_list的长度
    goldApi.defineProperty(this, "goodItem_list_size");
    // 定义一个存储string的list
    goldApi.defineMapProperty(this, "goodItem_list_array");
    // 3. 经过1和2步，数据结构定义完成，下面需要实现接口方法，所有的数据都存放在sample_data中
}
kitSys.prototype = {
    // 初始化方法，在使用ApiSample之前，务必要调用一次(而且只能调用一次)，所有的初始化逻辑都放到这里
    init: function() {
        if (this.kit_list_size == null) {
            this.kit_list_size = 0;
        }
		if (this.commentItem_list_size == null) {
            this.commentItem_list_size = 0;
        }
        if (this.goodItem_list_size == null) {
            this.goodItem_list_size = 0;
        }
    },
    // 添加一个对象到list中的例子
    add_kit_to_list: function(text) {
        var addResult = {
            success : false,
            message : ""
        };
        var obj = text;
        //obj.from = Blockchain.transaction.from;
        var result = this.query_kit_by_key(obj.from+"_"+obj.time);
        if(result.success){
            addResult.success = false;
            addResult.message = "You have added a kit!";
            return addResult;
        }else{
			obj.name = obj.name.trim();//名称
			obj.place = obj.place.trim();//地址
			obj.topic = obj.topic.trim();//攻略题目
			obj.hotel = obj.hotel.trim();//入住酒店
			obj.image = obj.image.trim();//图片
			obj.fee = obj.fee.trim();//费用
			obj.days = obj.days.trim();//出行天数
			obj.kit_text = obj.kit_text.trim();//攻略正文
			obj.time = obj.time.trim();//记录时间
			obj.from = obj.from.trim();
            
            if(obj.name===""|| obj.place===""||obj.topic==="" || obj.kit_text === "" || obj.image == ""){
                addResult.success = false;
                addResult.message = "empty name / place / topic / text / image";
                return addResult;
            }
            if (obj.name.length > 64 || obj.place.length > 64 || obj.topic.length > 64){
                addResult.success = false;
                addResult.message = "name / place / topic exceed limit length";
                return addResult;
            }
            var kit = new kitItem();
            kit.name = obj.name;
            kit.place = obj.place;
            kit.hotel = obj.hotel;
            kit.fee = obj.fee;
            kit.days = obj.days;
            kit.topic = obj.topic;
            kit.kit_text = obj.kit_text;
            kit.image = obj.image;
            kit.time = obj.time;
            kit.from = obj.from;
            var index = this.kit_list_size;
            this.kit_list_array.put(index,kit.from+"_"+kit.time);
            this.kit_list.put(kit.from+"_"+kit.time, kit);
            this.kit_list_size +=1;
            addResult.success = true;
            addResult.message = "You successfully added a kit!";
            return addResult;
        }
    },
	// 添加一个评论对象到list中的例子
    add_comment_to_list: function(text) {
        var addResult = {
            success : false,
            message : ""
        };
        var obj = text;
        //obj.from = Blockchain.transaction.from;
		obj.id = obj.id.trim();
		obj.kitKey = obj.kitKey.trim();
		obj.content = obj.content.trim();
		obj.commentTime = obj.commentTime.trim();
		obj.from = obj.from.trim();
		
		var comment = new CommentItem();
		comment.kitKey = obj.kitKey;
		comment.content = obj.content;
		comment.commentTime = obj.commentTime;
		comment.from = obj.from;
		
		var index = this.commentItem_list_size;
		this.commentItem_list_array.put(index,comment.kitKey);
		this.commentItem_list.put(comment.kitKey, comment);
		this.commentItem_list_size +=1;
		addResult.success = true;
		addResult.message = "You successfully added a comment!";
		return addResult;
    },
	

	// 添加一个对象到list中的例子
    add_like_to_list: function(text) {
        var addResult = {
            success : false,
            message : ""
        };
        var obj = text;
        //obj.from = Blockchain.transaction.from;
        //这里不做查询  如果存在直接覆盖
		obj.id = obj.id.trim();
		obj.from = obj.from.trim();
		obj.number = obj.number.trim();
		obj.kitKey = obj.kitKey.trim();
		obj.recordTime = obj.recordTime.trim();
		
		var like = new GoodItem();
		like.id = obj.id;
		like.from = obj.from;
		like.hotel = obj.hotel;
		like.number = obj.number;
		like.kitKey = obj.kitKey;
		like.recordTime = obj.recordTime;
		var index = this.goodItem_list_size;
		this.goodItem_list_array.put(index,like.kitKey);
		this.goodItem_list.put(like.kitKey, like);
		this.goodItem_list_size +=1;
		addResult.success = true;
		addResult.message = "You successfully added a like!";
		return addResult;
    },
	
    kit_list_size : function(){
        return this.kit_list_size;
    },
   
    query_my_kit: function(){
        var from = "1";//Blockchain.transaction.from;
        return this.query_kit_by_id(from);
    },
	// 根据id查找列表
	query_kit_by_id : function(from){
        var result = {
            success : false,
            type:"kitList",
            data : []
        };
        from = from.trim();
        if(from===""){
            result.success = false;
            return result;
        }
        var number = this.kit_list_size;
        var kit;
        var key;
        for(var i=0;i<number;i++){
            key = this.kit_list_array.get(i);
            kit = this.kit_list.get(key);
            if(kit&&from==kit.from){
                result.data.push(kit);
            }
        }
        if(result.data === ""){
            result.success = false;
        }else if(result.data.length>0){
            result.success = true;
        }else{
			result.success = false;
		}
        return result;
    },
	
	//获取对象
	query_kit_by_key: function(key) {
        var result = {
            success : false,
			type:"kit_info",
            kit : ""
        };
        key = key.trim();
        if ( key === "" ) {
            result.success = false;
            result.kit = "";
            return result;
        }
        var kit = this.kit_list.get(key);
        if(kit){
            result.success = true;
            result.kit = kit;
        }else{
            result.success = false;
            result.kit = "";
        }
        return result;
    },
	//获取对象
	query_like_by_key: function(key) {
        var result = {
            success : false,
			type:"like_info",
            like : ""
        };
        key = key.trim();
        if ( key === "" ) {
            result.success = false;
            result.like = "";
            return result;
        }
		var like=this.goodItem_list.get(key);
        if(like){
            result.success = true;
            result.like = like;
        }else{
            result.success = false;
            result.like = "";
        }
        return result;
    },
	//获取对象列表
	query_hot_kit: function(num) {
        var result = {
            success : false,
			type:"kit_list_like",
            data : ""
        };
		var length=this.goodItem_list_size;
		var list=this.goodItem_list;
		var like;
		if(length<=num){
			for(var i=0;i<length;i++){
				like=goodItem_list.get(i);
				result.data.push(kit);
			}
		}else{
			//排序选出前num条
			var j;
			var k;
			var flag=length;
			while(flag>0){
				 k = flag; //k 来记录遍历的尾边界
				flag = 0;
				for(j=1; j<k; j++){
					if(list[j-1] > list[j]){//前面的数字大于后面的数字就交换
						//交换a[j-1]和a[j]
						var temp;
						temp = list[j-1];
						list[j-1] = list[j];
						list[j]=temp;

						//表示交换过数据;
						flag = j;//记录最新的尾边界.
					}
				}

			}
			var kit;
			for(var i=0;i<num;i++){
				kit = this.kit_list.get(list[length-i].key);
				result.data.push(kit);
			}
		}
       
        if(result.data === ""||result.data.length<1){
            result.success = false;
        }else{
            result.success = true;
        }
        return result;
    },
	query_kit_by_page : function(searchKey,page){
        var result = {
            success : false,
            type:"kit_list",
            data : [],
            sum : 0
        };
        var pageNum=1;
        var pageSize=10;
        if(page!=undefined&&page!=null){
            if(page.pageNum!=undefined&&page.pageNum!=null){
                pageNum=page.pageNum;
            }
            if(page.pageSize!=undefined&&page.pageSize!=null){
                pageSize=page.pageSize;
            }
        }
        var number = this.kit_list_size;
        result.sum = number;
        var key;
        var kit;
		var dataList=[];
		for(var i=0;i<number;i++){
			 key = this.kit_list_array.get(i);
            kit = this.kit_list.get(key);
			var like=this.query_like_by_key(key).like;
			if(''!=like){
				kit.likeNum=like.number;
			}else{
				kit.likeNum=0;
			}
			var page={"pageSize":90000000,"pageNum":1};
			var comm_list=this.query_comment_by_page(key,page).data;
			kit.commNum=comm_list.length;
			if(searchKey){
				if(kit){
					if((kit.topic.indexOf(searchKey)!=-1)||(kit.hotel.indexOf(searchKey)!=-1)||(kit.place.indexOf(searchKey)!=-1)){
						dataList.push(kit);
					}
				}
			}else{
				dataList.push(kit);
			}
		}
		number=dataList.length;
		dataList=dataList.reverse();
        for(var i=(pageNum-1)*pageSize;i<number&&i<(pageNum*pageSize);i++){
            kit = dataList[i];
			result.data.push(kit);
        }
        if(result.data === ""||result.data.length<1){
            result.success = false;
        }else{
            result.success = true;
        }
        return result;
    },
	query_comment_by_page : function(keys,page){
        var result = {
            success : false,
            type:"commentItem_list",
            data : [],
            sum : 0
        };
        var pageNum=1;
        var pageSize=10;
        if(page!=undefined&&page!=null){
            if(page.pageNum!=undefined&&page.pageNum!=null){
                pageNum=page.pageNum;
            }
            if(page.pageSize!=undefined&&page.pageSize!=null){
                pageSize=page.pageSize;
            }
        }
        var number = this.commentItem_list_size;
        result.sum = number;
        var key;
        var comment;
		var dataList=[];
		for(var i=0;i<number;i++){
			key = this.commentItem_list_array.get(i);
            comment = this.commentItem_list.get(key);
			if(comment&&comment.from==keys){
				dataList.push(comment);
			}
		}
		number=dataList.length;
		dataList=dataList.reverse();
        for(var i=(pageNum-1)*pageSize;i<number&&i<(pageNum*pageSize);i++){
            
			comment = dataList[i];
			result.data.push(comment);
        }
        if(result.data === ""){
            result.success = false;
        }else{
            result.success = true;
        }
        return result;
    },
   query_kit_sum : function(){
		var result = {
			success : false,
			type:"kit_sum",
			sum : 0
		};
		result.sum = this.kit_list_size;
		result.success = true;
		return result;
	},
	query_comment_sum : function(from){
		var result = {
			success : false,
			type:"comment_sum",
			sum : 0
		};
		var key;
		var comment;
		var num=0;
		var number = this.commentItem_list_size;
		for(var i=0;i<number;i++){
			key = this.commentItem_list_array.get(i);
			comment = this.commentItem_list.get(key);
			if(comment&&comment.from==from){
				num++;
			}
			
		}
		result.sum = num;
		result.success = true;
		return result;
	},
};

window.kitSys = kitSys;