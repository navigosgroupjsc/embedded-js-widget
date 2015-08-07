var dataJobsList = [];
var translationData =
    {
        "show_less":{
            "vn":"Thu gọn",
            "en":"Show less"
        },"show_more":{
            "vn":"Xem thêm",
            "en":"Show more"
        },"Posted":{
            "vn":"Đăng tuyển",
            "en":"Posted"
        },
        "Industries":{
            "vn":"Ngành nghề",
            "en":"Industries"
        },
        "Benefits" : {
            "vn":"Phúc lợi",
            "en":"Benefits"
        },
        "Skills" : {
            "vn":"Kỹ năng",
            "en":"Skills"
        }
    };
define(['jquery', 'ractive', 'rv!templates/template', 'rv!templates/jobList', 'text!css/my-widget_embed.css'], function ($vnwWidget, Ractive, mainTemplate, jobListTemplate, css) {

    'use strict';
    $vnwWidget.noConflict(true);
    var app = {
        init: function () {
            Ractive.DEBUG = false;
            dataJobsList = [];
            var $style = $vnwWidget("<style></style>", {type: "text/css"});
            $style.text(css);
            $vnwWidget("head").append($style);

            // render our main view
            this.ractive = new Ractive({
                el: 'vietnamworks-jobs',
                template: mainTemplate,
                partials: {
                    jobList: jobListTemplate
                },
                data: {
                    cnt: 0,
                    ts: 'never'
                }
            });
            var lang = $vnwWidget('#vietnamworks-jobs').data('vnw-lang');
            if(lang == '2'){
                lang = 'en';
            }else{
                lang = 'vn';
            }
            var tranlation = {};
            $vnwWidget.each(translationData,function(key, value){
                tranlation[key] = value[lang];
            });
            this.ractive.set("translation",tranlation);
            loadJobListFromVNW($vnwWidget,this.ractive,1);
            this.ractive.on({
                mwClick: function (ev) {
                    ev.original.preventDefault();
                    var that = this;
                    dataJobsList = [];
                    loadJobListFromVNW($vnwWidget,that,1);
                }
            });
        },
        reload: function ($email,$job_title,$job_category,$job_location,$page_size,$lang) {
            Ractive.DEBUG = false;
            dataJobsList = [];
            var $style = $vnwWidget("<style></style>", {type: "text/css"});
            $style.text(css);
            $vnwWidget("head").append($style);

            // render our main view
            this.ractive = new Ractive({
                el: 'vietnamworks-jobs',
                template: mainTemplate,
                partials: {
                    jobList: jobListTemplate
                },
                data: {
                    cnt: 0,
                    ts: 'never'
                }
            });
            var that=this.ractive;
            var lang = $lang
            if(lang == '2'){
                lang = 'en';
            }else{
                lang = 'vn';
            }
            var tranlation = {};
            $vnwWidget.each(translationData,function(key, value){
                tranlation[key] = value[lang];
            });
            this.ractive.set("translation",tranlation);

            //call ajax
            $vnwWidget.ajax({
                url: "https://api-staging.vietnamworks.com/jobs/search-jsonp/",
                dataType: "jsonp",
                data: {
                    'CONTENT-MD5' : "4c443c7e2c515d6b4b4d693c2f63434a7773226a614846733c4c4d4348",
                    'email': $email,
                    'lang': $lang,
                    'job_title': $job_title,
                    'job_category': $job_category,
                    'job_location': $job_location,
                    'page_size': $page_size,
                    'current_page': 1
                }
            }).then(function (resp) {

                resp = $vnwWidget.parseJSON(resp);
                var dataJobsList=[];
                if(resp.data.jobs.length>0){
                    $vnwWidget.each( resp.data.jobs, function( key, value ) {
                        dataJobsList.push(value);
                    });
                }

                var totalDisplayJob = dataJobsList.length;
                var total = resp.data.total;
                that.set("jobs",dataJobsList);
                that.set("timeUpdate",resp.data.getListJobTime);
            }, function (resp) {
                console.log(resp);
            });
        }
    };

    return app;

});
function loadJobListFromVNW($vnwWidget,that,currentPage){
    pageSize = $vnwWidget('#vietnamworks-jobs').data('vnw-numjobs');
    if(pageSize == ''){
        pageSize = 5;
    }
    $vnwWidget.ajax({
        url: "https://api-staging.vietnamworks.com/jobs/search-jsonp/",
        dataType: "jsonp",
        data: {
            'CONTENT-MD5' : "4c443c7e2c515d6b4b4d693c2f63434a7773226a614846733c4c4d4348",
            'email': $vnwWidget('#vietnamworks-jobs').data('vnw-email'),
            'lang': $vnwWidget('#vietnamworks-jobs').data('vnw-lang'),
            'job_title': $vnwWidget('#vietnamworks-jobs').data('vnw-keyword'),
            'job_category': $vnwWidget('#vietnamworks-jobs').data('vnw-industry'),
            'job_location': $vnwWidget('#vietnamworks-jobs').data('vnw-location'),
            'page_size': pageSize,
            'current_page': currentPage
        }

    }).then(function (resp) {
        resp = $vnwWidget.parseJSON(resp);
        $vnwWidget.each( resp.data.jobs, function( key, value ) {
            dataJobsList.push(value);
        });
        var totalDisplayJob = dataJobsList.length;
        var total = resp.data.total;
        that.set("jobs",dataJobsList);
        $vnwWidget('#load-more-jobs-from-vnw').off('click');
        if(total>totalDisplayJob){
            $vnwWidget('#vietnamworks-jobs').one('click','#load-more-jobs-from-vnw',function(){
                var currentPage = totalDisplayJob/pageSize + 1;
                //currentPage = currentPage + 1;
                loadJobListFromVNW($vnwWidget,that,currentPage);
            });
            $vnwWidget('#load-more-jobs-from-vnw').show();
        }else{
            $vnwWidget('#load-more-jobs-from-vnw').hide();
        }
        that.set("timeUpdate",resp.data.getListJobTime);
    }, function (resp) {
        console.log(resp);
    });
}
