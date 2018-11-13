Date.prototype.addHours = function(h){
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
}
function postUrl(url, params){
    var method = "post";
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", url);
    for(var key in params){
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type","hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
    }
    document.body.appendChild(form);
    form.submit();
}

function hash(str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 3) - hash) + chr;
      hash |= 0; 
    }
    return hash;
}

function getColor(obj) {
    let colors=['#51cf66', '#fcc419', '#ff922b', '#ff6b6b', '#f06595', '#cc5de8', '#845ef7', '#5c7cfa',
                '#339af0', '#22b8cf', '#20c997', '#94d82d'];
    let rand = (hash(obj.title)+ Number(obj.start.slice(5,7))) % 11;
    return colors[rand];
}

function changeColor(data) {
    for(var i=0; i<data.length; i++) {
        data[i].color = getColor(data[i]);
    }
}

function getToday() {
    // 오늘 날짜 갖고 오기
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;

    var today = year + "-" + month + "-" + day;
    return today;  
}

function isNull(elm) {
    // Null 체크 함수
    return (elm == null || elm == "" || elm == "undefined" || elm[0] == " ") ? true : false
}


function checkInput() {
    // Input 값 null인지 체크
    if(isNull($("#owner")[0].value) === true) {
        alert("사용자가 안 적혀 있습니다. 확인해주세요");
        return $("#owner").focus().select();
    }
    if(isNull($("#phone")[0].value) === true) {
        alert("연락처가 안 적혀 있습니다. 확인해주세요");
        return $("#phone").focus().select();
    } 
    if(isNull($("#password")[0].value) === true) {
        alert("패스워드가 안 적혀 있습니다. 확인해주세요");
        return $("#password").focus().select();
    } 
    if(isNull($("#title")[0].value) === true) {
        alert("표기될 이름이 안 적혀 있습니다. 확인해주세요");
        return $("#title").focus().select();
    } 
    if(isNull($("#date")[0].value) === true) {
        alert("날짜가 안 적혀 있습니다. 확인해주세요");
        return $("#date").focus().select();
    }
    if(isNull($("#start_time")[0].value) === true) {
        alert("예약 시작 시간이 안 적혀 있습니다. 확인해주세요");
        return $("#start_time").focus().select();
    } 
    if(isNull($("#end_time")[0].value) === true) {
        alert("예약 종료 시간이 안 적혀 있습니다. 확인해주세요");
        return $("#end_time").focus().select();
    }
    return 0;
}

$(document).ready(function() {
    $("#date").attr("value", getToday()); // 날짜 폼에 기본적인 오늘 날짜(Date) 넣기
    $.get("/events").done(function(data) {
        changeColor(data);
        $("#calendar").fullCalendar({
            defaultView: "agendaWeek",
            allDayslot: false,
            slotEventOverlap: false,
            minTime: "09:00:00",
            maxTime: "21:00:00",
            nowIndicator: true,
            now: new Date(),
            selectable: true,
            header: { right: "today prev next, agendaWeek", left: ""},
            events: data,
            eventClick: function(calEvent, jsEvent, view) {
                var password = prompt("본인확인 비밀번호를 적어주세요(평소에 쓰는 비밀번호 기재 금지)");
                var params = {
                    password: password,
                    start: calEvent.start,
                    end: calEvent.end
                }
                postUrl("/delete", params);
            }
        });
    });
    $("#dialog").dialog({
        modal: true,
        autoOpen:false,
        title: "예약 신청",
        resizable:true
    });
    $("#reservation").click(function () {
        $("#dialog").dialog("open");
    });
    $("#ok").click(function() {
        if (checkInput() === 0) {
            var owner = $("#owner")[0].value;
            var phone = $("#phone")[0].value;
            var title = $("#title")[0].value;
            var password = $("#password")[0].value;
            var date = $("#date")[0].value;
            var starttime = $("#start_time")[0].value;
            var endtime = $("#end_time")[0].value;
            var params = {
                owner: owner,
                phone: phone,
                title: title,
                password: password,
                start: (new Date(date+"T"+starttime+":00Z")).addHours(0),
                end:(new Date(date+"T"+endtime+":00Z")).addHours(0),
            };
            postUrl("/events", params);
        }
    });
    $("#cancel").click(function (){
        $("#dialog").dialog("close");
    });
    $("#date").value=(new Date()).toISOString().substr(0,10);
});
var is_safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
if(is_safari){
    alert("Safari는 브라우저상에서 날짜 폼을 지원하지 않아 지원하지 않습니다.");
    $("#reservation").prop("disabled", true);
}
