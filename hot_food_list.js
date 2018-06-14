

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
        self.show_hot_list();
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
    show_hot_list:function(){
        var req_args = [];
        req_args.push(HOT_NUM);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_hot_food_list",
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
                    if (obj.type == "hot_food_list") {
                        self.parse_hot_food_info(obj);
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

	parse_hot_food_info: function(food_data) {
        $("#loading_list").hide();
        $("#kit_list").show();
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

var kitObj=new FoodListShow();

function checkNebpay() {
    if(typeof(webExtensionWallet) === "undefined"){
        alert ("程序依赖于Extension wallet，请先安装后再使用，谢谢！")
        // $("#noExtension").removeClass("hide")
    }

    // 环境ok，拉取数据
    kitObj = new FoodListShow();
    kitObj.listenWindowMessage();
    kitObj.init();
    
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



function initPage() {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");
        $("#kit_list").hide();
        $("#list_pagination").hide();
        $("#loading_list").show();

        $("#list_content").hide();
        $("#loading_list_fenye").show();
        
        setTimeout(checkNebpay,1000);
    });
}


initPage();