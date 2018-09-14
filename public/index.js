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
function numEvents(date)
{
    totalEvents = $('#calendar').fullCalendar('clientEvents').length;
    var count = 0;
    for (i=0;i<totalEvents;i++){
        var event = $("#calendar").fullCalendar("clientEvents")[i];
        var starttime =new Date(event.start).getTime();
        var endtime = new Date(event.end).getTime();
        if (starttime<= date.getTime() && endtime > date.getTime()) {
            count++;
        }
    }
    return count;
}

$(document).ready(function() {
    $.get("/events").done(function(data) {
        $("#calendar").fullCalendar({
            defaultView: "agendaWeek",
            minTime: "09:00:00",
            maxTime: "21:00:00",
            nowIndicator: true,
            now: new Date(),
            selectable: true,
            header: { right: "today prev next, agendaWeek", left: ""},
            events: data,
            eventAfterRender: function(event, element, view) {
                var width = $(element).width();
                var numevent = numEvents(new Date(event.start));
                if(numevent==1) width = (width/2);
                $(element).css('width', width+'px');
            },
            select: function(start, end) {
                if((new Date(end).getTime()-new Date(start).getTime()) / (1000*60*60) > 3){
                    alert("3시간 초과는 신청 불가능 합니다.");
                    return;
                }
                var owner = prompt("사용자 이름을 넣어주세요");
                if(owner === null ) return;
                var phone = prompt("핸드폰 번호를 넣어주세요(비상연락수단)");
                if(phone === null ) return;
                var title = prompt("책임자의 이름을 적어주세요(캘린더 표기)");
                if(title === null ) return;
                var password = prompt("본인확인 비밀번호를 적어주세요(평소에 쓰는 비밀번호 기재 금지)");
                if(password === null) return;
                if(owner === null || title === null || password == null) return;
                var params = {
                    owner: owner,
                    phone: phone,
                    title: title,
                    password: password,
                    start: start,
                    end: end
                }
                postUrl("/events", params);
            },
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
    });
    $("#reservation").click(function () {
        $("#dialog").dialog("open");
    });
});
