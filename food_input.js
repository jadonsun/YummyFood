'use strict';

var dappAddress = "n1eJ3EM3ezDqnpxPo8MJtTn4RUTSNUe5Gut";
// var dappAddress = "n1skDiY9YgdM5o6fxyjMefd2vXX1kPCSY6j";
var InputFood = function() {

}
InputFood.prototype = {

    init: function() {
        var self = this;
        $("#submit").click(function() {
            self.commitkit();
        });

        self.add_sub_mat();

        self.del_sub_mat();

        self.add_food_step();

        self.del_food_step();
    },

    add_sub_mat: function() {
        $("#add_sub").click(function() {
            $("#sub_list").append('<li class="clearfix"><p class="p1"><span><i>*</i>辅料</span><input type="text" class="js_food_sub_name"  placeholder="比如食盐"/></p>'+
                                '<p><span><i>*</i>分量</span><input type="text" class="js_food_sub_weight" placeholder="比如1茶匙"/></p></li>');
        });
    },
    del_sub_mat: function() {
        $("#sub_sub").click(function() {
            $("#sub_list li:last-child").remove();
        });
    },

    add_food_step: function() {
        $("#add_one_step").click(function() {
            $("#step_list").append('<li><span class="span_nei"><i>*</i>步骤</span><textarea class="js_food_step" name="" rows="7" cols="" value="" placeholder="请填写步骤描述"></textarea></li>');
        });
    },

    del_food_step: function() {
        $("#sub_one_step").click(function() {
            $("#step_list li:last-child").remove();
        });
    },

	showMessage:function (message){
		layer.open({
			content: message,
			skin: 'msg',
			time: 2
		});
	},
    commitkit: function() {
        var self = this;
        var author_name = $("#author_name").val();
        var food_name = $("#food_name").val();
        var food_summary = $("#food_summary").val();
        var food_main = $("#food_main").val();
        var food_type = $("#food_type").val();

        // 辅料
        var sub_mat_list = [];
        $('#sub_list').find('li').each(function() {
            var sub_name = $(this).find(".js_food_sub_name").val();
            var sub_weight = $(this).find(".js_food_sub_weight").val();
            sub_mat_list.push({
                "sub_name": sub_name,
                "sub_weight": sub_weight
            });
        });
        var sub_mat_string = JSON.stringify(sub_mat_list);

        // 步骤
        var step_list = [];
        $('#step_list').find('li').each(function() {
            var step_value = $(this).find(".js_food_step").val();
            step_list.push(step_value);
        });
        var step_list_string = JSON.stringify(step_list);

        var food_image = $("#food_image").attr("src");
        var submit_time = getNowFormatDate();
        var warning_note = "";
		
       if(author_name == "") {
		    $("#author_name").focus();
            self.showMessage('请填写昵称');
            // 弹框
            return;
        }
		if(food_name == "") {
			$("#food_name").focus();
            self.showMessage('请填写食谱名称');
            // 弹框
            return;
        }
        if (food_summary == "") {
			$("#food_summary").focus();
            self.showMessage('请填写食谱简介');
            // 弹框
            return;
        }

        if (food_type == "") {
            $("#food_type").focus();
            self.showMessage('请填写菜系');
            // 弹框
            return;
        }
		
        if (food_main == "") {
			$("#food_main").focus();
            self.showMessage('请填写食谱主食材');
            // 弹框
            return;
        }
		
		
		if (sub_mat_string == "") {
           	$("#sub_list").focus();
            self.showMessage('请填写最少一个辅料');
            // 弹框
            return;
        }
       
        if (step_list_string == "") {
            $("#step_list").focus();
            self.showMessage('请填写最少一个烹饪步骤');
            // 弹框
            return;
        }

        if (food_image != "" && food_image != "images/upimg.png") {
			var file_src=$("#myfile").attr("src");
             var length = food_image.replace(/[^\u0000-\u00ff]/g,"aaa").length;
             console.log(length);
             if (length > 112400) {
                 $("#myfile").focus();
                 self.showMessage('抱歉，暂时不支持大图片，请选择小图片(base64编码大小需小于128K)"');
                 // 弹框
                 return;
             }
        }
        if (food_image == "images/upimg.png") {
            $("#myfile").focus();
            self.showMessage('请上传图片');
            // 弹框
            return;
        }
        // 提交
        var func = "add_food_info_to_list";
        var req_arg_item = {
            "name": author_name,
            "food_type": food_type,
            "food_name": food_name,
            "food_summary": food_summary,
            "main_mat": food_main,
			"sub_mat" : sub_mat_string,
			"cook_book" : step_list_string,
			"time" : submit_time,
            "image": food_image,
            "time_stamp": Date.parse(new Date())
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
    },

    listenWindowMessage: function() {
        var self = this;
        window.addEventListener('message', function(e) {
            // e.detail contains the transferred data
            if(e.data && e.data.data && e.data.data.neb_call) {
                // 收到返回数据
                if(e.data.data.neb_call.result) {
                    // 解析数据
                    var obj = JSON.parse(e.data.data.neb_call.result);
					self.showMessage(obj.message);
					setTimeout('window.location.reload()',2000);
                    //console.log(obj);
                } else {
                    console.log("Get Data From Constract Faield");
                }
            }
        });
    }
}
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

var inputFoodObj;

function checkNebpay() {
    if(typeof(webExtensionWallet) === "undefined"){
        alert ("程序依赖于Extension wallet，请先安装后再使用，谢谢！")
        // $("#noExtension").removeClass("hide")
    }

    // 环境ok，拉取数据
    inputFoodObj = new InputFood();
    inputFoodObj.init();
    inputFoodObj.listenWindowMessage();
}

function initPage() {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");
        $("#kit_input_warning").hide();
        setTimeout(checkNebpay,1000);
    });
}

initPage();
    