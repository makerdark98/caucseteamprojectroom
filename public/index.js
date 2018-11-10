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
    let rand = hash(obj.title) % 11;
    return colors[rand];
}

function changeColor(data) {
    for(var i=0; i<data.length; i++) {
        data[i].color = getColor(data[i]);
    }
}

$(document).ready(function() {
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
    });
    $("#cancel").click(function (){
        $("#dialog").dialog("close");
    });
    $("#date").value=(new Date()).toISOString().substr(0,10);
});
