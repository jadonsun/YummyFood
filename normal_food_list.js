

'use strict';

var dappAddress = "n1eu6NpcqhMqSu8qUsUQxgfFHrgcs4PvrGg";
// var dappAddress = "n1skDiY9YgdM5o6fxyjMefd2vXX1kPCSY6j";

var HOT_NUM = 8;

var click_zan_obj = null;
var dw_zan_num = 0;

var FoodListShow = function() {
    this.click_zan_obj = null;
    this.dw_zan_num = 0;
}
FoodListShow.prototype = {

    init: function() {
        var self = this;

        var searchKey=UrlParm.parm("key");  
		if(searchKey){
			$("#search_input").val(searchKey);
        }
        self.load_food_num();
    },

    load_food_num: function() {
        var req_args = [];
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_food_sum",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    },

    init_zan: function() {
        var self = this;
        $(".js_click_zan").click(function() {
            var key = $(this).attr("data-key");
            dw_zan_num = $(this).find("p").text().trim();
            dw_zan_num = parseInt(dw_zan_num);
            var food_topic = $(this).attr("data-topic");
            var record_time = getNowFormatDate();
            
            // 提交
            var func = "add_like_to_list";
            var req_arg_item = {
                "food_info_key": key,
                "id": food_topic,
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

            click_zan_obj = $(this);
        });
    },

    refresh_like_num_after_click: function() {
        var curdw_zan_num = dw_zan_num + 1;
        click_zan_obj.find("p").html("&nbsp;&nbsp;&nbsp;" + curdw_zan_num);
        dw_zan_num = 0;
    },

    show_food_list:function(page,searchKey){
        var req_args = [];
        req_args.push(searchKey,page);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_food_list_by_page",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    },

    listenWindowMessage: function() {
        var self = this;
        window.addEventListener('message', function(e) {
            if(!!e.data.data.txhash){
                window.setTimeout(self.refresh_like_num_after_click, 10000);
            }
            // e.detail contains the transferred data
            if(e.data && e.data.data && e.data.data.neb_call) {
                // 收到返回数据
                if(e.data.data.neb_call.result) {
                    // 解析数据
                    var obj = JSON.parse(e.data.data.neb_call.result);
                    if (obj.type == "food_sum") {
                        self.parse_food_num(obj);
                    } else if(obj.type == "food_info_list") {
                        self.parse_food_list_info(obj);
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

    parse_food_num: function(obj) {
        paginationObj.init(obj.sum);
        paginationObj.showPagination(); 
    },

	parse_food_list_info: function(food_data) {
        $("#loading_list").hide();
        $("#food_list").show();
        $("#list_pagination").show();

        $("#loading_list_fenye").hide();
        $("#list_content").show();
        
        if (food_data.data.length == 0) {
            $("#food_list").hide();
        } else {
            $("#food_list").empty().show();
            // 显示内容
            var food_list = template(document.getElementById('food_list_t').innerHTML);
            var food_list_html = food_list({list: food_data.data});
            $("#food_list").append(food_list_html);
        }


        this.init_zan();

    },
}

var foodlistObj=new FoodListShow();

function checkNebpay() {
    if(typeof(webExtensionWallet) === "undefined"){
        alert ("程序依赖于Extension wallet，请先安装后再使用，谢谢！")
        // $("#noExtension").removeClass("hide")
    }

    // 环境ok，拉取数据
    foodlistObj = new FoodListShow();
    foodlistObj.listenWindowMessage();
    foodlistObj.init();
    
}

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

function loadUl() {
    $(window).load(function() {
        $("#flexiselDemo3").flexisel({
            visibleItems:1,
            animationSpeed: 1000,
            autoPlay: false,
            autoPlaySpeed: 5000,    		
            pauseOnHover: true,
            enableResponsiveBreakpoints: true,
            responsiveBreakpoints: { 
                portrait: { 
                    changePoint:480,
                    visibleItems:1
                }, 
                landscape: { 
                    changePoint:640,
                    visibleItems:1
                },
                tablet: { 
                    changePoint:768,
                    visibleItems:1
                }
            }
        });
    });
}


function initPage() {
    loadUl();
    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");
        $("#food_list").hide();
        $("#list_pagination").hide();
        $("#loading_list").show();

        $("#list_content").hide();
        $("#loading_list_fenye").show();
        
        setTimeout(checkNebpay,1000);
    });
}


initPage();


var SHOW_NUM_PER_PAGE = 8;

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
		var searchKey=UrlParm.parm("key");  
        foodlistObj.show_food_list(page,searchKey);
    },
}

var paginationObj = new Pagination();