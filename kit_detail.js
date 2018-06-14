

//'use strict';

var dappAddress = "n1wJnLij4SZAGPagCBpTfWP8P683sMBsBxw";
// var dappAddress = "n1skDiY9YgdM5o6fxyjMefd2vXX1kPCSY6j";

var commit_comment_info = {
    "content": "",
    "id": "",
    "commentTime": "",
    "kitKey": "",
    "time_stamp": 0
};

var Detailkit = function() {
    this.kitKey = "";

    this.commit_type = "";

    this.from = "";
    
}
Detailkit.prototype = {

    init: function() {
        var self = this;
        var key=UrlParm.parm("key");  
		if(!key){
			window.location.href="404error.html";
        }
        this.kitKey = key;
        self.initkitInfo(key);
		self.initLike(key);
		
		var page={"pageSize":9,"pageNum":1};
		self.showcommentSum(key);
		//点赞
		$(".heart").click(function() {
			self.initkitInfo(key);
            self.commitLike();
        });
		//评论
		$("#sub_comment").click(function() {
            self.commitComment();
        });

        // 打赏
        self.bindDaShangEvent();
    },
    
    bindDaShangEvent: function() {
        var self = this;
        var func = "rewardOther";
        
        $("#dashang").click(function() {
            if(self.from != "") {
                var info = {
                    "address": self.from,
                    "key": self.kitKey,
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
    commitComment: function() {
		var self = this;
        var kit_name = $("#kit_name").text();
        var kit_time = $("#kit_time").text();
        var content = $("#comment_content").val();
        var kit_topic = $("#kit_topic").text();
        var commentTime = getNowFormatDate();
        var time_stamp = Date.parse(new Date());
		if(''==content){
			return;
		}
		$("#comment_content").val("");
        // 提交
        var func = "add_comment_to_list";
        var req_arg_item = {
            "content": content,
            "id": kit_topic,
            "commentTime":commentTime,
            "kitKey": self.kitKey,
            "time_stamp": time_stamp
        };
        commit_comment_info.content = content;
        commit_comment_info.id = kit_topic;
        commit_comment_info.commentTime = commentTime;
        commit_comment_info.kitKey = self.kitKey;
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
	commitLike: function() {
		var self = this;
        var kit_topic = $("#kit_topic").text();
        var recordTime = getNowFormatDate();
		
        // 提交
        var func = "add_like_to_list";
        var req_arg_item = {
            "kitKey": self.kitKey,
            "id": kit_topic,
			"recordTime":recordTime
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


    initLike:function(key){
        var req_args = [];
        req_args.push(key);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_like_by_key",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    },
	showcommentSum:function(key){
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
	initComment:function(key,page){
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
	initkitInfo:function(key){
        var req_args = [];
        req_args.push(key);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_kit_by_key",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    },
    refreshLikeNumAfterClick: function() {
        var self = this;
        var like_num = parseInt($("#likeCount").html());
        $("#likeCount").text(like_num + 1);
        
    },

    refreshCommentAfterAdd: function() {
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
                    window.setTimeout(self.refreshLikeNumAfterClick, 10000);
                    self.commit_type = "";
                } else if(self.commit_type == "comment") {
                    window.setTimeout(self.refreshCommentAfterAdd, 10000);
                    self.commit_type = "";
                }
            }
            
            if(e.data && e.data.data && e.data.data.neb_call) {
                // 收到返回数据
                if(e.data.data.neb_call.result) {
                    // 解析数据
                    var obj = JSON.parse(e.data.data.neb_call.result);
                    if (obj.type == "kit_info") {
                        self.parsekitInfo(obj);
                    }else if (obj.type == "commentItem_list") {
                        self.parseCommentList(obj);
                    }else if (obj.type == "like_info") {
                        self.parselikeInfo(obj);
                    } else if (obj.type == "comment_sum") {
                        self.parsecommentSum(obj);
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

    parsekitInfo: function(obj) {
        var self = this;
        $("#loading_kit_detail").hide();
        $("#content_kit_detail").show();
        if(obj.success==true){
            var kit=obj.kit;

            self.from = kit.from;
            console.log(kit);
			
            $("#kit_name").text(kit.name);
            $("#kit_topic").text(kit.topic);
            $("#kit_place").text(kit.place);
            $("#kit_days").text(kit.days);
            $("#kit_hotel").text(kit.hotel);
            $("#kit_fee").text(kit.fee);
            $("#kit_text").html(kit.kit_text);
            $("#kit_time").text(kit.time);
            if (kit.image != "" && kit.image != "images/upimg.png") {
                $("#kit_image").attr('src',kit.image);
            }
            
        }else{
			window.location.href="404error.html";
		}
    },
	parselikeInfo: function(obj) {
        if(obj.success==true){
            var like=obj.like;
            $("#likeCount").text(like.number);
        }
    },
	parseCommentList : function(comment_list){

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
	parsecommentSum: function(obj) {
        paginationObj.init(obj.sum);
        paginationObj.showPagination(); 
    },
   
}

var kitObj=new Detailkit();

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
    kitObj = new Detailkit();
    kitObj.listenWindowMessage();
    kitObj.init();
    
}
function initPage() {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");
        $("#content_kit_detail").hide();
        $("#loading_kit_detail").show();
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

        kitObj.initComment(key,page);
    },
}

var paginationObj = new Pagination();