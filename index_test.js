

'use strict';

var PictureSaveAndRead = function() {

};
var pre_url="";
var pre_file="";
var pre_value="";
PictureSaveAndRead.prototype = {
    init: function() {
        var self = this;
		$("#food_image").on('click',function(){
			$("#myfile").click();
		});
        $("#myfile").on('change', function () {
			var file_src = self.getFileUrl(this.id);
			$("#myfile").attr("src",file_src);
			// $("#myfile").attr("name",pre_file);
			// $("#myfile").attr("value",pre_value);
			if(''!=file_src){
				self.transImgToBase64(file_src).then(function(retBase64) {
					$("#food_image").attr("src", retBase64);
					// console.log(retBase64);
				});
			}else{
				$("#food_image").attr("src", "images/upimg.png");
			}
			//self.loadImg();
			
        });
        // $("#submit").on('click', function() {
            // var file_src = self.getFileUrl("myfile");
			// if(undefined!=file_src&&''!=file_src)
			// self.transImgToBase64(file_src).then(function(retBase64) {
				// $("#papers_image").attr("src", retBase64);
				// // console.log(retBase64);
			// });
        // });
    },
	loadImg:function (){
		var self = this;
		var file_src = self.getFileUrl("myfile");
		if(undefined!=file_src&&''!=file_src)
		self.transImgToBase64(file_src).then(function(retBase64) {
			$("#papers_image").attr("src", retBase64);
			// console.log(retBase64);
		});
	},
    transImgToBase64: function(img_url) {
        var self = this;
        var image = new Image;
        // image.crossOrigin = "Anonymous";
        image.src = img_url;
        image.crossOrigin = "Anonymous";
        var deferred=$.Deferred();
        image.onload = function (){
            //将base64传给done上传处理
            deferred.resolve(self.getBase64OfPic(image));
        }
        return deferred.promise();//问题要让onload完成后再return

    },

    getBase64OfPic: function(img_obj) {
        var canvas = document.createElement("canvas");
        canvas.width = 232;
        canvas.height = 332;
        // if (canvas.width > 350) {
        //     canvas.width = 350;
        // }
        // if (canvas.height > 250) {
        //     canvas.height = 250;
        // }
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img_obj, 0, 0, canvas.width, canvas.height);
        var data_url = canvas.toDataURL('image/jpeg', 0.5);
        return data_url;
    },

    getFileUrl: function(input_id) {
		var input =document.getElementById(input_id).value;
		if(''==input)
			return "";
		
		pre_value=input;
        var url;
        if (navigator.userAgent.indexOf("MSIE")>=1) { // IE
            url = document.getElementById(input_id).value;
			 var fileSystem = new ActiveXObject("Scripting.FileSystemObject");        
			 var file = fileSystem.GetFile (url); 
			pre_file=file;
        } else if(navigator.userAgent.indexOf("Firefox")>0) { // Firefox
            url = window.URL.createObjectURL(document.getElementById(input_id).files.item(0));
			pre_file=document.getElementById(input_id).files[0];
        } else if(navigator.userAgent.indexOf("Chrome")>0) { // Chrome
            url = window.URL.createObjectURL(document.getElementById(input_id).files.item(0));
			pre_file=document.getElementById(input_id).files[0];
        }
		pre_url=url;
        return url;
    }
}


function testFunc() {
    var picTrans = new PictureSaveAndRead();
    picTrans.init();
}

testFunc();