

//'use strict';

var dappAddress = "n1eJ3EM3ezDqnpxPo8MJtTn4RUTSNUe5Gut";
// var dappAddress = "n1skDiY9YgdM5o6fxyjMefd2vXX1kPCSY6j";

var commit_comment_info = {
    "content": "",
    "id": "",
    "comment_time": "",
    "food_info_key": "",
    "time_stamp": 0
};

var DetailFood = function() {
    this.food_info_key = "";

    this.commit_type = "";

    this.from = "";
    
}
DetailFood.prototype = {

    init: function() {
        var self = this;
        var key=UrlParm.parm("key");  
		if(!key){
			// window.location.href="404error.html";
        }
        this.food_info_key = key;
        self.show_food_info(key);
		
		var page={"pageSize":9,"pageNum":1};
		self.query_comment_num(key);
		//点赞
		$("#like1").click(function() {
            self.commit_like();
        });
		//评论
		$("#sub_comment").click(function() {
            self.commit_comment();
        });

        // 打赏
        self.bind_da_shang_event();
    },
    
    bind_da_shang_event: function() {
        var self = this;
        var func = "rewardOther";
        
        $("#dashang").click(function() {
            if(self.from != "") {
                var info = {
                    "address": self.from,
                    "key": self.food_info_key,
                };
                var args = [];
                args.push(info);
                
                window.postMessage({
                    "target": "contentscript",
                    "data":{
                        "to" : dappAddress,
                        "value" : "0.02",
                        "contract" : {
                            "function" : func,
                            "args" : JSON.stringify(args),
                        }
                    },
                    "method": "neb_sendTransaction"
                }, "*");
            }
        });
    },
    commit_comment: function() {
		var self = this;
        var content = $("#comment_content").val();
        var food_name = $("#food_name").text();
        var comment_time = getNowFormatDate();
        var time_stamp = Date.parse(new Date());
		if(''==content){
			return;
		}
		$("#comment_content").val("");
        // 提交
        var func = "add_comment_to_list";
        var req_arg_item = {
            "content": content,
            "id": food_name,
            "comment_time":comment_time,
            "food_info_key": self.food_info_key,
            "time_stamp": time_stamp
        };
        commit_comment_info.content = content;
        commit_comment_info.id = food_name;
        commit_comment_info.comment_time = comment_time;
        commit_comment_info.food_info_key = self.food_info_key;
        commit_comment_info.time_stamp = time_stamp;
        var req_args = [];
        req_args.push(req_arg_item);

        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : func,
                    "args" : JSON.stringify(req_args),
                }
            },
            "method": "neb_sendTransaction"
        }, "*");
        self.commit_type = "comment";
    },
	commit_like: function() {
		var self = this;
        var food_name = $("#food_name").text();
        var record_time = getNowFormatDate();
		
        // 提交
        var func = "add_like_to_list";
        var req_arg_item = {
            "food_info_key": self.food_info_key,
            "id": food_name,
			"record_time":record_time
        };
        var req_args = [];
        req_args.push(req_arg_item);

        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : func,
                    "args" : JSON.stringify(req_args),
                }
            },
            "method": "neb_sendTransaction"
        }, "*");
        self.commit_type = "like";
    },

	query_comment_num:function(key){
        var req_args = [];
		req_args.push(key);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_comment_sum",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    },

	query_comment_by_page:function(key,page){
        var req_args = [];
        req_args.push(key);
        req_args.push(page);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_comment_by_page",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    },

	show_food_info:function(key){
        var req_args = [];
        req_args.push(key);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_foodinfo_by_key",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    },

    refresh_like_num_after_click: function() {
        var self = this;
        var like_num = parseInt($("#likeCount").html());
        $("#likeCount").text(like_num + 1);
        
    },

    refresh_comment_after_add: function() {
        // 插入评论
        var self = this;
        var kits = template(document.getElementById('comment_list_t').innerHTML);
        var temp_array = [];
        temp_array.push(commit_comment_info);
        var kits_html = kits({list: temp_array});
        $("#comment_list").prepend(kits_html);
        $("#comment_list").show();

    },
    listenWindowMessage: function() {
        var self = this;
        window.addEventListener('message', function(e) {
            // e.detail contains the transferred data
            if(!!e.data.data.txhash){
                if (self.commit_type == "like") {
                    window.setTimeout(self.refresh_like_num_after_click, 10000);
                    self.commit_type = "";
                } else if(self.commit_type == "comment") {
                    window.setTimeout(self.refresh_comment_after_add, 10000);
                    self.commit_type = "";
                }
            }
            
            if(e.data && e.data.data && e.data.data.neb_call) {
                // 收到返回数据
                if(e.data.data.neb_call.result) {
                    // 解析数据
                    var obj = JSON.parse(e.data.data.neb_call.result);
                    if (obj.type == "food_item_info") {
                        self.parse_food_detail_info(obj);
                    }else if (obj.type == "comment_item_list") {
                        self.parse_comment_list(obj);
                    } else if (obj.type == "comment_sum") {
                        self.parse_comment_num(obj);
                    } else {
                        console.log("no need attation");
                    }
                    console.log(obj);
                } else {
                    console.log("Get Data From Constract Faield");
                }
            }
        });
    },

    parse_food_detail_info: function(obj) {
        var self = this;
        $("#loading_food_detail").hide();
        $("#content_food_detail").show();
        if(obj.success==true){

            var food_info = obj.food_item;

            self.from = food_info.from;

			
            $("#food_name").text(food_info.food_name);
            $("#food_auth_name").text(food_info.name);
            $("#food_time").text(food_info.time);
            $("#likeCount").text(food_info.like_num);
            $("#food_summary").text(food_info.food_summary);
            $("#food_tpye").text(food_info.food_type);
            $("#main_mat").text(food_info.main_mat);
            self.parse_submat_list(food_info.sub_mat);
            self.parse_cook_book_list(food_info.cook_book);
            
            if (food_info.image != "" && food_info.image != "images/upimg.png") {
                $("#food_image").attr('src',food_info.image);
            }
            
        }else{
			window.location.href="404error.html";
		}
    },

    parse_submat_list: function(submat) {
        var list_submat_data = JSON.parse(submat);
        var list_submat = template(document.getElementById('submat_list_t').innerHTML);
        var submat_html = list_submat({list: list_submat_data});
        $("#sub_mat_list").append(submat_html);
    },

    parse_cook_book_list: function(cook_book) {
        var cook_book_list_data = JSON.parse(cook_book);
        var cook_book_list = template(document.getElementById('cook_book_list_t').innerHTML);
        var cook_book_html = cook_book_list({list: cook_book_list_data});
        $("#cook_book_step").append(cook_book_html);
    },
    
	parse_comment_list : function(comment_list){

        $("#loading_kit_comment").hide();
        $("#info-show").show();
        
		if (comment_list.data.length == 0) {
            $("#comment_list").hide();
            $("#comment_warning").show();
            $("#pagination_page").hide();
        } else {
            $("#comment_warning").hide();
            $("#comment_list").empty().show();
            $("#pagination_page").show();
            // 显示内容
            var kits = template(document.getElementById('comment_list_t').innerHTML);
            var kits_html = kits({list: comment_list.data});
            $("#comment_list").append(kits_html);
        }

	},
	parse_comment_num: function(obj) {
        paginationObj.init(obj.sum);
        paginationObj.showPagination(); 
    },
   
}

var foodObj=new DetailFood();

//获取当前时间
	function getNowFormatDate() {
		var date = new Date();
		var seperator1 = "-";
		var seperator2 = ":";
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if (month >= 1 && month <= 9) {
		month = "0" + month;
		}
		if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
		}
		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
		+ " " + date.getHours() + seperator2 + date.getMinutes()
		+ seperator2 + date.getSeconds();
		return currentdate;
	}
function checkNebpay() {
    if(typeof(webExtensionWallet) === "undefined"){
        alert ("程序依赖于Extension wallet，请先安装后再使用，谢谢！")
        // $("#noExtension").removeClass("hide")
    }

    // 环境ok，拉取数据
    foodObj = new DetailFood();
    foodObj.listenWindowMessage();
    foodObj.init();
    
}
function initPage() {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");
        $("#content_food_detail").hide();
        $("#loading_food_detail").show();
        setTimeout(checkNebpay,1000);
    });
}

initPage();

var SHOW_NUM_PER_PAGE = 10;

var Pagination = function() {
    this.list_index = [];
    this.page_size = SHOW_NUM_PER_PAGE;
    this.showGoInput = true;
    this.showGoButton = true;
};

Pagination.prototype = {
    // 初始化
    init: function(totalNum) {
        this.list_index=[];
        for(var i = 1; i <= totalNum; i++) {
            this.list_index.push(i);
        }
    },

    // 显示分页插件
    showPagination: function() {
        var self = this;
        $('#pagination').pagination({
            dataSource: this.list_index,
            pageSize: this.page_size,
            showGoInput: true,
            showGoButton: true,
            callback: function(data, pagination) {
                var click_page_num = pagination.pageNumber;
                var list_offset = data[0];
                self.onChoosePageEvent(click_page_num, list_offset);
            }
        });
    },

    // 选择页事件
    onChoosePageEvent: function(click_page_num, list_offset) {
        console.log("click_page_num = " + click_page_num + "; list_offset=" + list_offset);
        var page={
            "pageSize":this.page_size,
            "pageNum":click_page_num
        };
        var key=UrlParm.parm("key");

        $("#info-show").hide();
        $("#loading_kit_comment").show();

        foodObj.query_comment_by_page(key,page);
    },
}

var paginationObj = new Pagination();