"use strict";

var FoodInfoItem = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name; // 发布者名称
        this.food_type = obj.food_type; // 菜系
        this.food_name = obj.food_name;// 菜品名称
        this.food_summary = obj.food_summary;// 难易程度
        this.image = obj.image;//图片
        this.main_mat = obj.main_mat;// 主料
		this.sub_mat = obj.sub_mat;// 辅料(JSON串)
		this.cook_book = obj.cook_book;//菜谱详情
        this.time = obj.time;//记录时间
		this.like_num = obj.like_num;//点赞数
		this.comm_num = obj.comm_num;//评论数
        this.from = obj.from;
        this.food_info_key = obj.food_info_key;
	} else {
	    this.name = "";
        this.food_type = "";
        this.food_name = "";
        this.food_summary="";
		this.image="";
		this.sub_mat="";
		this.main_mat="";
		this.cook_book="";
		this.time ="";
		this.like_num =0;
		this.comm_num =0;
        this.from = "";
        this.food_info_key = "";
	}
};
var CommentItem = function(text) {//评论
	if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;//id=from+'_'+时间戳
        this.food_info_key = obj.food_info_key;
        this.content = obj.content;
        this.comment_time = obj.comment_time;
        this.from = obj.from;
        this.comment_key = obj.comment_key;
	} else {
        this.id = "";
        this.food_info_key = "";
        this.content = "";
        this.comment_time = "";
        this.from = "";
        this.comment_key = "";
	}
};
var GoodItem = function(text) {//点赞记录信息
	if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;//id=from+'_'+时间戳
        this.food_info_key = obj.food_info_key;
        this.number = obj.number;
        this.record_time = obj.record_time;
        this.from = obj.from;
	} else {
        this.id = "";
        this.food_info_key = "";
        this.number = 0;
        this.record_time = "";
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

FoodInfoItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var FoodShare = function() {
    // 1. 先创建GoldSunStorage对象（用于存储数据）
    // 2. 定义数据结构，该行代码作用：为ApiSample创建一个属性sample_data，该属性是一个list结构，list中存储的是SampleDataItem对象
    LocalContractStorage.defineMapProperty(this, "food_info_list", {
        parse: function (text) {
            return new FoodInfoItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "food_info_list_size");
    // 定义一个存储string的list
    LocalContractStorage.defineMapProperty(this, "food_info_list_array");

	 //评论列表
    LocalContractStorage.defineMapProperty(this, "comment_item_list", {
        parse: function (text) {
            return new CommentItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    // 定义一个参数，记录comment_item_list的长度
    LocalContractStorage.defineProperty(this, "comment_item_list_size");
    // 定义一个存储string的list
    LocalContractStorage.defineMapProperty(this, "comment_item_list_array");
	
	
    //点赞列表
    LocalContractStorage.defineMapProperty(this, "good_item_list", {
        parse: function (text) {
            return new GoodItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    // 定义一个参数，记录good_item_list的长度
    LocalContractStorage.defineProperty(this, "good_item_list_size");
    // 定义一个存储string的list
    LocalContractStorage.defineMapProperty(this, "good_item_list_array");
    // 3. 经过1和2步，数据结构定义完成，下面需要实现接口方法，所有的数据都存放在sample_data中
}
FoodShare.prototype = {
    // 初始化方法，在使用ApiSample之前，务必要调用一次(而且只能调用一次)，所有的初始化逻辑都放到这里
    init: function() {
        if (this.food_info_list_size == null) {
            this.food_info_list_size = 0;
        }
		if (this.comment_item_list_size == null) {
            this.comment_item_list_size = 0;
        }
        if (this.good_item_list_size == null) {
            this.good_item_list_size = 0;
        }
    },
    // 添加一个对象到list中的例子
    add_food_info_to_list: function(text) {
        var addResult = {
            success : false,
            message : ""
        };
        var obj = text;
        obj.from = Blockchain.transaction.from;
        var result = this.query_foodinfo_by_key(obj.from+"_"+obj.time_stamp);
        if(result.success){
            addResult.success = false;
            addResult.message = "You have added a food!";
            return addResult;
        }else{
			obj.name = obj.name.trim();//名称
			obj.food_type = obj.food_type.trim();//地址
			obj.food_name = obj.food_name.trim();//攻略题目
			obj.food_summary = obj.food_summary.trim();//入住酒店
			obj.image = obj.image.trim();//图片
			obj.sub_mat = obj.sub_mat.trim();//费用
			obj.main_mat = obj.main_mat.trim();//出行天数
			obj.cook_book = obj.cook_book.trim();//攻略正文
			obj.time = obj.time.trim();//记录时间
			obj.from = obj.from.trim();
            
            if(obj.name===""|| obj.food_type===""||obj.food_name==="" || obj.cook_book === "" || obj.image == ""){
                addResult.success = false;
                addResult.message = "empty name / food_type / food_name / text / image";
                return addResult;
            }
            var food_item = new FoodInfoItem();
            food_item.name = obj.name;
            food_item.food_type = obj.food_type;
            food_item.food_summary = obj.food_summary;
            food_item.sub_mat = obj.sub_mat;
            food_item.main_mat = obj.main_mat;
            food_item.food_name = obj.food_name;
            food_item.cook_book = obj.cook_book;
            food_item.image = obj.image;
            food_item.time = obj.time;
            food_item.from = obj.from;
            food_item.food_info_key = food_item.from+"_"+ obj.time_stamp;
            var index = this.food_info_list_size;
            this.food_info_list_array.put(index,food_item.from+"_"+obj.time_stamp);
            this.food_info_list.put(food_item.from+"_"+obj.time_stamp, food_item);
            this.food_info_list_size +=1;
            addResult.success = true;
            addResult.message = "You successfully added a food!";
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
        obj.from = Blockchain.transaction.from;
		obj.id = obj.id.trim();
        obj.food_info_key = obj.food_info_key.trim();
        obj.comment_key = obj.from + "_" + obj.time_stamp;
		obj.content = obj.content.trim();
        obj.comment_time = obj.comment_time.trim();

		
		var comment = new CommentItem();
		comment.food_info_key = obj.food_info_key;
		comment.content = obj.content;
		comment.comment_time = obj.comment_time;
        comment.from = obj.from;
        comment.comment_key = obj.comment_key;
		
		var index = this.comment_item_list_size;
		this.comment_item_list_array.put(index, obj.comment_key);
		this.comment_item_list.put(obj.comment_key, comment);
		this.comment_item_list_size +=1;
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
        obj.from = Blockchain.transaction.from;
        //这里不做查询  如果存在直接覆盖
		obj.id = obj.id.trim();
		// obj.food_info_key = obj.food_info_key.trim();
		obj.record_time = obj.record_time.trim();
        
        
        var like_cur = this.good_item_list.get(obj.food_info_key);
        if (like_cur) {
            var like_num = like_cur.number;
            like_cur.number = like_num + 1;
            this.good_item_list.put(like_cur.food_info_key, like_cur);
        } else {
            var like = new GoodItem();
            like.id = obj.id;
            like.from = obj.from;
            like.number = 1;
            like.food_info_key = obj.food_info_key;
            like.record_time = obj.record_time;
            var index = this.good_item_list_size;
            this.good_item_list_array.put(index,like.food_info_key);
            this.good_item_list.put(like.food_info_key, like);
            this.good_item_list_size +=1;
        }

		
		addResult.success = true;
		addResult.message = "You successfully added a like!";
		return addResult;
    },
	
    food_info_list_size : function(){
        return this.food_info_list_size;
    },

    _array_contains: function(arr, obj) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === obj) {
                return true;
            }
        }
        return false;
    },

    query_hot_food_list: function(hot_num) {
        var result = {
            success : false,
			type:"hot_food_list",
            data : []
        };
        if (this.food_info_list_size <= hot_num) {
            for(var i = this.food_info_list_size - 1; i >= 0 ; i--) {
                var food_info = this.food_info_list.get(this.food_info_list_array.get(i));
                var out_info = {
                    food_name: food_info.food_name,
                    food_summary: food_info.food_summary,
                    image: food_info.image,
                    like_num: food_info.like_num,
                    comm_num: food_info.comm_num,
                    food_info_key: food_info.food_info_key,
                    name: food_info.name,
                    time: food_info.time,
                    food_type: food_info.food_type
                };
                var like_info = this._query_like_by_key(out_info.food_info_key).like;
                if ("" != like_info) {
                   out_info.like_num = like_info.number;
                }
                // 更新评论信息
                var comment_num_info = this.query_comment_sum(out_info.food_info_key);
                if (comment_num_info.success == true) {
                    out_info.comm_num = comment_num_info.sum;
                }
                result.data.push(out_info);
            }
            result.success = true;
            return result;
        }
        // 按照星星排序
        var temp_hostest_food_key = [];
        var last_temp_food_key = "";
        if(hot_num < this.good_item_list_size) {
            // 查询
            for(var i = 0; i < hot_num; i++) {
                var good_key = this.good_item_list_array.get(this.good_item_list_size - 1);
                var star_num = this.good_item_list.get(good_key).number;
                var temp_food_key = this.good_item_list.get(good_key).food_info_key;
                for(var j = this.good_item_list_size - 1; j >= 0; j--) {
                    var cur_good_key = this.good_item_list_array.get(j);
                    var cur_num = this.good_item_list.get(cur_good_key).number;
                    var cur_food_key = this.good_item_list.get(cur_good_key).food_info_key;
                    if (star_num < cur_num && last_temp_food_key != cur_food_key) {
                        star_num = cur_num;
                        temp_food_key = cur_food_key;
                    }
                }
                temp_hostest_food_key.push(temp_food_key);
                last_temp_food_key = temp_food_key;
            }
        } else {
            //
            for(var j = this.good_item_list_size - 1; j >= 0; j--) {
                var cur_good_key = this.good_item_list_array.get(j);
                var cur_food_key = this.good_item_list.get(cur_good_key).food_info_key;
                temp_hostest_food_key.push(cur_food_key);
            }

            var need_num = (hot_num - this.good_item_list_size);
            var index = 0;
            for(var i = this.food_info_list_size - 1; i >= 0; i--) {
                var food_info = this.food_info_list.get(this.food_info_list_array.get(i));
                var b_contain = this._array_contains(temp_hostest_food_key, food_info.food_info_key);
                if (!b_contain) {
                    temp_hostest_food_key.push(food_info.food_info_key);
                    index++;
                }
                if (index >= need_num) {
                    break;
                }
                
            }
        }
        
        // 获取key info
        for(var i = 0; i < temp_hostest_food_key.length; i++) {
            var cur_food = this.food_info_list.get(temp_hostest_food_key[i]);
            var out_info = {
                food_name: cur_food.food_name,
                food_summary: cur_food.food_summary,
                image: cur_food.image,
                like_num: cur_food.like_num,
                comm_num: cur_food.comm_num,
                food_info_key: cur_food.food_info_key,
                name: cur_food.name,
                time: cur_food.time,
                food_type: cur_food.food_type
            };
            var like_info = this._query_like_by_key(out_info.food_info_key).like;
            if ("" != like_info) {
                out_info.like_num = like_info.number;
            }
            // 更新评论信息
            var comment_num_info = this.query_comment_sum(out_info.food_info_key);
            if (comment_num_info.success == true) {
                out_info.comm_num = comment_num_info.sum;
            }
            result.data.push(out_info);
        }
        result.success = true;
        return result;
    },
   
	
	//获取对象
	query_foodinfo_by_key: function(key) {
        var result = {
            success : false,
			type:"food_item_info",
            food_item : ""
        };
        key = key.trim();
        if ( key === "" ) {
            result.success = false;
            result.food_item = "";
            return result;
        }
        var food_item = this.food_info_list.get(key);
        if(food_item){
            result.success = true;
            result.food_item = food_item;
            // 更新赞信息
            var like_info = this._query_like_by_key(key).like;
            if ("" != like_info) {
                result.food_item.like_num = like_info.number;
            }
            // 更新评论信息
            var comment_num_info = this.query_comment_sum(key);
            if (comment_num_info.success == true) {
                result.food_item.comm_num = comment_num_info.num;
            }
            
        }else{
            result.success = false;
            result.food_item = "";
        }
        return result;
    },
    
	//获取对象
	_query_like_by_key: function(key) {
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
		var like=this.good_item_list.get(key);
        if(like){
            result.success = true;
            result.like = like;
        }else{
            result.success = false;
            result.like = "";
        }
        return result;
    },

	query_food_list_by_page : function(searchKey,page){
        var result = {
            success : false,
            type:"food_info_list",
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
        var number = this.food_info_list_size;
        result.sum = number;
        var key;
        var food_item;
		var dataList=[];
		for(var i=0;i<number;i++){
			key = this.food_info_list_array.get(i);
            food_item = this.food_info_list.get(key);
			var like=this._query_like_by_key(key).like;
			if(''!=like){
				food_item.like_num=like.number;
			}else{
				food_item.like_num=0;
			}
			var page={"pageSize":90000000,"pageNum":1};
			var comm_list=this.query_comment_by_page(key,page).data;
			food_item.comm_num=comm_list.length;
			if(searchKey){
				if(food_item){
					if((food_item.food_name.indexOf(searchKey)!=-1)||(food_item.food_summary.indexOf(searchKey)!=-1)||(food_item.food_type.indexOf(searchKey)!=-1)){
                        var out_info = {
                            food_name: food_item.food_name,
                            food_summary: food_item.food_summary,
                            image: food_item.image,
                            like_num: food_item.like_num,
                            comm_num: food_item.comm_num,
                            food_info_key: food_item.food_info_key,
                            name: food_item.name,
                            time: food_item.time,
                            food_type: food_item.food_type
                        };
						dataList.push(out_info);
					}
				}
			}else{
                var out_info = {
                    food_name: food_item.food_name,
                    food_summary: food_item.food_summary,
                    image: food_item.image,
                    like_num: food_item.like_num,
                    comm_num: food_item.comm_num,
                    food_info_key: food_item.food_info_key,
                    name: food_item.name,
                    time: food_item.time,
                    food_type: food_item.food_type
                };
                dataList.push(out_info);
			}
		}
		number=dataList.length;
		dataList=dataList.reverse();
        for(var i=(pageNum-1)*pageSize;i<number&&i<(pageNum*pageSize);i++){
            food_item = dataList[i];
			result.data.push(food_item);
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
            type:"comment_item_list",
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
        var number = this.comment_item_list_size;
        result.sum = number;
        var key;
        var comment;
		var dataList=[];
		for(var i=0;i<number;i++){
			key = this.comment_item_list_array.get(i);
            comment = this.comment_item_list.get(key);
			if(comment&&comment.food_info_key==keys){
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
    query_food_sum : function(){
		var result = {
			success : false,
			type:"food_sum",
			sum : 0
		};
		result.sum = this.food_info_list_size;
		result.success = true;
		return result;
    },
    
	query_comment_sum : function(food_info_key){
		var result = {
			success : false,
			type:"comment_sum",
			sum : 0
		};
		var key;
		var comment;
		var num=0;
		var number = this.comment_item_list_size;
		for(var i=0;i<number;i++){
			key = this.comment_item_list_array.get(i);
			comment = this.comment_item_list.get(key);
			if(comment&&comment.food_info_key == food_info_key){
				num++;
			}
			
		}
		result.sum = num;
		result.success = true;
		return result;
    },
    
    rewardOther: function(info) {
        // {"address":"", key:""}
        var fromUser = Blockchain.transaction.from,
            value = Blockchain.transaction.value;
        var food_info = this.food_info_list.get(info.key);
        if (food_info) {
            var result = Blockchain.transfer(info.address, value);
            return result
        }

        
    },
};

// window.kitSys = FoodShare;
module.exports = FoodShare;