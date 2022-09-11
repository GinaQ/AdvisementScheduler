/*
@license
dhtmlxScheduler v.4.4.0 Stardard

This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
scheduler.config.occurrence_timestamp_in_utc=!1,
scheduler.config.recurring_workdays=[1,2,3,4,5],
scheduler.form_blocks.recurring={
    _get_node:function(e){
        return"string"==typeof e&&(e=document.getElementById(e)),"none"==e.style.display&&(e.style.display=""),e
    },
    _outer_html:function(e){
        function t(e){
            var t,
            a=document.createElement("div");
            return a.appendChild(e.cloneNode(!0)),
            t=a.innerHTML,a=null,t
        }
        return e.outerHTML||t(e)
    },
    render:function(e){
        if(e.form){
            var t=scheduler.form_blocks.recurring,
            a=t._get_node(e.form),
            r=t._outer_html(a);
            return a.style.display="none",r
        }
        return scheduler.__recurring_template
    },
    _ds:{},
    _get_form_node:function(e,t,a){
        var r=e[t];
        if(!r)return null;
        if(r.nodeName)return r;
        if(r.length)for(var n=0;n<r.length;n++)
        if(r[n].value==a)return r[n]
    },
    _get_node_value:function(e,t,a){
        var r=e[t];
        if(!r)return"";
        if(r.length){
            if(a){
                for(var n=[],i=0;i<r.length;i++) r[i].checked&&n.push(r[i].value);
                return n
            }
            for(var i=0;i<r.length;i++)
                if(r[i].checked) return r[i].value
        }return r.value?a?[r.value]:r.value:void 0
    },
    _get_node_numeric_value:function(e,t){
        var a=scheduler.form_blocks.recurring._get_node_value(e,t);
        return 1*a||0
    },
    _set_node_value:function(e,t,a){
        var r=e[t];
        if(r)if(r.name==t)r.value=a;
        else if(r.length)
        for(var n="object"==typeof a,i=0;i<r.length;i++)
            (n||r[i].value==a)&&(r[i].checked=n?!!a[r[i].value]:!!a)
    },
    _init_set_value:function(e,t,a){
        function r(e){
            for(var t=0;t<e.length;t++){
                var a=e[t];
            if(a.name)
                if(g[a.name])
                    if(g[a.name].nodeType){
                        var r=g[a.name];
                        g[a.name]=[r,a]
                    }
                    else g[a.name].push(a);
                else g[a.name]=a
            }
        }
        function n(){
            m("dhx_repeat_day").style.display="none",
            m("dhx_repeat_week").style.display="none",
            m("dhx_repeat_month").style.display="none",
            m("dhx_repeat_year").style.display="none",
            m("dhx_repeat_"+this.value).style.display="block",
            scheduler.setLightboxSize()
        }
        function i(e){
            var t=[c(g,"repeat")];
            for(y[t[0]](t,e);t.length<5;)
                t.push("");
            var a="",r=s(g);
            if("no"==r)e.end=new Date(9999,1,1),
                a="no";
            else if("date_of_end"==r)
                e.end=u(c(g,"date_of_end"));
            else{
                scheduler.transpose_type(t.join("_")),
                a=Math.max(1,c(g,"occurences_count"));
                var n=0;
                e.end=scheduler.date.add(new Date(e.start),a+n,t.join("_"));
            }
            return t.join("_")+"#"+a
        }
        function s(e){
            var t=e.end;
            if(t.length){
                for(var a=0;a<t.length;a++)
                if(t[a].checked)
                    return t[a].value&&"on"!=t[a].value?t[a].value:a?2==a?"date_of_end":"occurences_count":"no"
            }
            else if(t.value) return t.value;
            return"no"
        }
        function d(e,t){
            var a=e.end;
            if(a.length){
                var r=!!a[0].value&&"on"!=a[0].value;
                if(r)
                for(var n=0;n<a.length;n++)a[n].value==t&&(a[n].checked=!0);
                else{
                    var i=0;switch(t){
                        case"no":i=0;break;
                        case"date_of_end":i=2;
                        break;
                        default:i=1
                    }
                    a[i].checked=!0
                }
            }
            else a.value=t
        }
        function l(e,t){
            var a=scheduler.form_blocks.recurring._set_node_value,r=e.split("#");
            switch(e=r[0].split("_"),b[e[0]](e,t),r[1]){
                case"no":d(g,"no");
                break;
                case"":d(g,"date_of_end");
                var n=t.end;
                scheduler.config.include_end_by&&(n=scheduler.date.add(n,-1,"day")),
                    a(g,"date_of_end",v(n));
                break;
                default:d(g,"occurences_count"),
                    a(g,"occurences_count",r[1])
            }
            a(g,"repeat",e[0]);
            var i=scheduler.form_blocks.recurring._get_form_node(g,"repeat",e[0]);
            "SELECT"==i.nodeName&&i.onchange?i.onchange():i.onclick&&i.onclick()
        }
        var o=scheduler.form_blocks.recurring,c=o._get_node_value,_=o._set_node_value;
        scheduler.form_blocks.recurring._ds={
            start:a.start_date,
            end:a._end_date
        };
        var h=scheduler.date.str_to_date(scheduler.config.repeat_date),
        u=function(e){
            var t=h(e);
            return scheduler.config.include_end_by&&(t=scheduler.date.add(t,1,"day")),t
        },
        v=scheduler.date.date_to_str(scheduler.config.repeat_date),
        f=e.getElementsByTagName("FORM")[0],g={};
        if(r(f.getElementsByTagName("INPUT")),r(f.getElementsByTagName("SELECT")),!scheduler.config.repeat_date_of_end){
            var p=scheduler.date.date_to_str(scheduler.config.repeat_date);
            scheduler.config.repeat_date_of_end=p(scheduler.date.add(scheduler._currentDate(),30,"day"))
        }
        _(g,"date_of_end",scheduler.config.repeat_date_of_end);
        var m=function(e){return document.getElementById(e)||{style:{}}};
        scheduler.form_blocks.recurring._get_repeat_code=i;
        var y={
            month:function(e,t){
                var a=scheduler.form_blocks.recurring._get_node_value,
                r=scheduler.form_blocks.recurring._get_node_numeric_value;
                "d"==a(g,"month_type")?(e.push(Math.max(1,r(g,"month_count"))),
                t.start.setDate(a(g,"month_day"))):(e.push(Math.max(1,r(g,"month_count2"))),
                e.push(a(g,"month_day2")),
                e.push(Math.max(1,r(g,"month_week2"))),
                scheduler.config.repeat_precise||t.start.setDate(1)),
                t._start=!0
            },
            week:function(e,t){
                var a=scheduler.form_blocks.recurring._get_node_value,
                r=scheduler.form_blocks.recurring._get_node_numeric_value;
                e.push(Math.max(1,r(g,"week_count"))),
                e.push(""),
                e.push("");
                for(var n=[],i=a(g,"week_day",!0),s=t.start.getDay(),d=!1,l=0;l<i.length;l++)
                    n.push(i[l]),
                d=d||i[l]==s;n.length||(n.push(s),d=!0),
                n.sort(),
                scheduler.config.repeat_precise?d||(scheduler.transpose_day_week(t.start,n,1,7),
                t._start=!0):(t.start=scheduler.date.week_start(t.start),
                t._start=!0),
                e.push(n.join(","))
            },
            day:function(e){
                var t=scheduler.form_blocks.recurring._get_node_value,
                a=scheduler.form_blocks.recurring._get_node_numeric_value;
                "d"==t(g,"day_type")?e.push(Math.max(1,a(g,"day_count"))):(e.push("week"),
                e.push(1),
                e.push(""),
                e.push(""),
                e.push(scheduler.config.recurring_workdays.join(",")),
                e.splice(0,1))
            },
            year:function(e,t){
                var a=scheduler.form_blocks.recurring._get_node_value;
                "d"==a(g,"year_type")?(e.push("1"),
                t.start.setMonth(0),
                t.start.setDate(a(g,"year_day")),
                t.start.setMonth(a(g,"year_month"))):(e.push("1"),
                e.push(a(g,"year_day2")),
                e.push(a(g,"year_week2")),
                t.start.setDate(1),
                t.start.setMonth(a(g,"year_month2"))),
                t._start=!0
            }
        },
        b={
            week:function(e,t){
                var a=scheduler.form_blocks.recurring._set_node_value;a(g,"week_count",e[1]);for(var r=e[4].split(","),n={},i=0;i<r.length;i++)n[r[i]]=!0;a(g,"week_day",n)
            },
            month:function(e,t){
                var a=scheduler.form_blocks.recurring._set_node_value;""===e[2]?(a(g,"month_type","d"),
                a(g,"month_count",e[1]),a(g,"month_day",t.start.getDate())):(a(g,"month_type","w"),a(g,"month_count2",e[1]),a(g,"month_week2",e[3]),a(g,"month_day2",e[2]))
            },
            day:function(e,t){
                var a=scheduler.form_blocks.recurring._set_node_value;a(g,"day_type","d"),a(g,"day_count",e[1])
            },
            year:function(e,t){
                var a=scheduler.form_blocks.recurring._set_node_value;""===e[2]?(a(g,"year_type","d"),a(g,"year_day",t.start.getDate()),a(g,"year_month",t.start.getMonth())):(a(g,"year_type","w"),a(g,"year_week2",e[3]),a(g,"year_day2",e[2]),
                a(g,"year_month2",t.start.getMonth()))
            }
        };
        scheduler.form_blocks.recurring._set_repeat_code=l;
        for(var x=0;x<f.elements.length;x++){
            var w=f.elements[x];
            switch(w.name){case"repeat":"SELECT"==w.nodeName?w.onchange=n:w.onclick=n}
        }
        scheduler._lightbox._rec_init_done=!0
    },
    set_value:function(e,t,a){
        var r=scheduler.form_blocks.recurring;scheduler._lightbox._rec_init_done||r._init_set_value(e,t,a),e.open=!a.rec_type,this._is_modified_occurence(a)?e.blocked=!0:e.blocked=!1;var n=r._ds;n.start=a.start_date,n.end=a._end_date,
        r.button_click(0,e.previousSibling.firstChild.firstChild,e,e),t&&r._set_repeat_code(t,n)
    },
    get_value:function(e,t){
        if(e.open){var a=scheduler.form_blocks.recurring._ds,r={};this.formSection("time").getValue(r),a.start=r.start_date,t.rec_type=scheduler.form_blocks.recurring._get_repeat_code(a),a._start?(t.start_date=new Date(a.start),t._start_date=new Date(a.start),a._start=!1):t._start_date=null,t._end_date=a.end,t.rec_pattern=t.rec_type.split("#")[0]}else t.rec_type=t.rec_pattern="",t._end_date=t.end_date;
        return t.rec_type
    },
    _get_button:function(){
        var e=scheduler.formSection("recurring").header;return e.firstChild.firstChild
    },
    _get_form:function(){return scheduler.formSection("recurring").node},
    open:function(){
        var e=scheduler.form_blocks.recurring,t=e._get_form();t.open||e._toggle_block()
    },
    close:function(){
        var e=scheduler.form_blocks.recurring,t=e._get_form();t.open&&e._toggle_block()
    },
    _toggle_block:function(){
        var e=scheduler.form_blocks.recurring,t=e._get_form(),a=e._get_button();t.open||t.blocked?(t.style.height="0px",
        a&&(a.style.backgroundPosition="-5px 20px",a.nextSibling.innerHTML=scheduler.locale.labels.button_recurring)):(t.style.height="auto",a&&(a.style.backgroundPosition="-5px 0px",a.nextSibling.innerHTML=scheduler.locale.labels.button_recurring_open)),t.open=!t.open,scheduler.setLightboxSize()
    },
    focus:function(e){},
    button_click:function(e,t,a,r){
        scheduler.form_blocks.recurring._toggle_block()
    }
},
scheduler._rec_markers={},
scheduler._rec_markers_pull={},
scheduler._add_rec_marker=function(e,t){
    e._pid_time=t,
    this._rec_markers[e.id]=e,this._rec_markers_pull[e.event_pid]||(this._rec_markers_pull[e.event_pid]={}),this._rec_markers_pull[e.event_pid][t]=e
},
scheduler._get_rec_marker=function(e,t){
    var a=this._rec_markers_pull[t];return a?a[e]:null
},
scheduler._get_rec_markers=function(e){
    return this._rec_markers_pull[e]||[]
},
scheduler._rec_temp=[],function(){
    var e=scheduler.addEvent;scheduler.addEvent=function(t,a,r,n,i){
        var s=e.apply(this,arguments);if(s){
            var d=scheduler.getEvent(s);this._is_modified_occurence(d)&&scheduler._add_rec_marker(d,1e3*d.event_length),
            d.rec_type&&(d.rec_pattern=d.rec_type.split("#")[0])
        }return s
    }
}(),
scheduler.attachEvent("onEventIdChange",function(e,t){
    if(!this._ignore_call){
        this._ignore_call=!0,scheduler._rec_markers[e]&&(scheduler._rec_markers[t]=scheduler._rec_markers[e],delete scheduler._rec_markers[e]),scheduler._rec_markers_pull[e]&&(scheduler._rec_markers_pull[t]=scheduler._rec_markers_pull[e],delete scheduler._rec_markers_pull[e]);for(var a=0;a<this._rec_temp.length;a++){var r=this._rec_temp[a];r.event_pid==e&&(r.event_pid=t,
        this.changeEventId(r.id,t+"#"+r.id.split("#")[1]))}for(var a in this._rec_markers){var r=this._rec_markers[a];r.event_pid==e&&(r.event_pid=t,r._pid_changed=!0)}var n=scheduler._rec_markers[t];n&&n._pid_changed&&(delete n._pid_changed,setTimeout(function(){scheduler.callEvent("onEventChanged",[t,scheduler.getEvent(t)])},1)),delete this._ignore_call
    }
}),
scheduler.attachEvent("onConfirmedBeforeEventDelete",function(e){
    var t=this.getEvent(e);if(this._is_virtual_event(e)||this._is_modified_occurence(t)&&t.rec_type&&"none"!=t.rec_type){
        e=e.split("#");var a=this.uid(),r=e[1]?e[1]:t._pid_time/1e3,n=this._copy_event(t);n.id=a,n.event_pid=t.event_pid||e[0];var i=r;n.event_length=i,n.rec_type=n.rec_pattern="none",this.addEvent(n),this._add_rec_marker(n,1e3*i)
    }else{
        t.rec_type&&this._lightbox_id&&this._roll_back_dates(t);var s=this._get_rec_markers(e);for(var d in s)s.hasOwnProperty(d)&&(e=s[d].id,this.getEvent(e)&&this.deleteEvent(e,!0))
    }return!0
}),
scheduler.attachEvent("onEventDeleted",function(e,t){
    !this._is_virtual_event(e)&&this._is_modified_occurence(t)&&(scheduler._events[e]||(t.rec_type=t.rec_pattern="none",
    this.setEvent(e,t)))
}),
scheduler.attachEvent("onEventChanged",function(e){
    if(this._loading)return!0;var t=this.getEvent(e);if(this._is_virtual_event(e)){var e=e.split("#"),a=this.uid();this._not_render=!0;var r=this._copy_event(t);r.id=a,r.event_pid=e[0];var n=e[1];r.event_length=n,r.rec_type=r.rec_pattern="",this._add_rec_marker(r,1e3*n),this.addEvent(r),this._not_render=!1}else{t.rec_type&&this._lightbox_id&&this._roll_back_dates(t);var i=this._get_rec_markers(e);for(var s in i)i.hasOwnProperty(s)&&(delete this._rec_markers[i[s].id],
    this.deleteEvent(i[s].id,!0));delete this._rec_markers_pull[e];for(var d=!1,l=0;l<this._rendered.length;l++)this._rendered[l].getAttribute("event_id")==e&&(d=!0);d||(this._select_id=null)}return!0
}),
scheduler.attachEvent("onEventAdded",function(e){
    if(!this._loading){var t=this.getEvent(e);t.rec_type&&!t.event_length&&this._roll_back_dates(t)}return!0
}),
scheduler.attachEvent("onEventSave",function(e,t,a){
    var r=this.getEvent(e);return r.rec_type||!t.rec_type||this._is_virtual_event(e)||(this._select_id=null),
    !0
}),
scheduler.attachEvent("onEventCreated",function(e){
    var t=this.getEvent(e);return t.rec_type||(t.rec_type=t.rec_pattern=t.event_length=t.event_pid=""),!0
}),
scheduler.attachEvent("onEventCancel",function(e){
    var t=this.getEvent(e);t.rec_type&&(this._roll_back_dates(t),this.render_view_data())
}),
scheduler._roll_back_dates=function(e){
    e.event_length=(e.end_date.valueOf()-e.start_date.valueOf())/1e3,e.end_date=e._end_date,e._start_date&&(e.start_date.setMonth(0),e.start_date.setDate(e._start_date.getDate()),
    e.start_date.setMonth(e._start_date.getMonth()),e.start_date.setFullYear(e._start_date.getFullYear()))
},
scheduler._is_virtual_event=function(e){
    return-1!=e.toString().indexOf("#")
},
scheduler._is_modified_occurence=function(e){
    return e.event_pid&&"0"!=e.event_pid
},
scheduler._validId=function(e){
    return!this._is_virtual_event(e)
},
scheduler.showLightbox_rec=scheduler.showLightbox,scheduler.showLightbox=function(e){
    var t=this.locale,a=scheduler.config.lightbox_recurring,r=this.getEvent(e),n=r.event_pid,i=this._is_virtual_event(e);
    i&&(n=e.split("#")[0]);var s=function(e){var t=scheduler.getEvent(e);return t._end_date=t.end_date,t.end_date=new Date(t.start_date.valueOf()+1e3*t.event_length),scheduler.showLightbox_rec(e)};if((n||1*n===0)&&r.rec_type)return s(e);if(!n||"0"===n||!t.labels.confirm_recurring||"instance"==a||"series"==a&&!i)return this.showLightbox_rec(e);if("ask"==a){var d=this;dhtmlx.modalbox({text:t.labels.confirm_recurring,title:t.labels.title_confirm_recurring,width:"500px",position:"middle",buttons:[t.labels.button_edit_series,t.labels.button_edit_occurrence,t.labels.icon_cancel],
    callback:function(t){switch(+t){case 0:return s(n);case 1:return d.showLightbox_rec(e);case 2:return}}})}else s(n)
},
scheduler.get_visible_events_rec=scheduler.get_visible_events,scheduler.get_visible_events=function(e){
    for(var t=0;t<this._rec_temp.length;t++)delete this._events[this._rec_temp[t].id];this._rec_temp=[];for(var a=this.get_visible_events_rec(e),r=[],t=0;t<a.length;t++)a[t].rec_type?"none"!=a[t].rec_pattern&&this.repeat_date(a[t],r):r.push(a[t]);return r
},
function(){
    var e=scheduler.isOneDayEvent;
    scheduler.isOneDayEvent=function(t){return t.rec_type?!0:e.call(this,t)};var t=scheduler.updateEvent;scheduler.updateEvent=function(e){var a=scheduler.getEvent(e);a&&a.rec_type&&(a.rec_pattern=(a.rec_type||"").split("#")[0]),a&&a.rec_type&&!this._is_virtual_event(e)?scheduler.update_view():t.call(this,e)}
}(),
scheduler.transponse_size={
    day:1,week:7,month:1,year:12
},
scheduler.date.day_week=function(e,t,a){
    e.setDate(1),a=7*(a-1);var r=e.getDay(),n=1*t+a-r+1;e.setDate(a>=n?n+7:n)
},
scheduler.transpose_day_week=function(e,t,a,r,n){
    for(var i=(e.getDay()||(scheduler.config.start_on_monday?7:0))-a,s=0;s<t.length;s++)if(t[s]>i)return e.setDate(e.getDate()+1*t[s]-i-(r?a:n));this.transpose_day_week(e,t,a+r,null,a)
},
scheduler.transpose_type=function(e){
    var t="transpose_"+e;if(!this.date[t]){var a=e.split("_"),r=864e5,n="add_"+e,i=this.transponse_size[a[0]]*a[1];if("day"==a[0]||"week"==a[0]){var s=null;if(a[4]&&(s=a[4].split(","),scheduler.config.start_on_monday)){for(var d=0;d<s.length;d++)s[d]=1*s[d]||7;s.sort()}this.date[t]=function(e,t){
    var a=Math.floor((t.valueOf()-e.valueOf())/(r*i));a>0&&e.setDate(e.getDate()+a*i),s&&scheduler.transpose_day_week(e,s,1,i)},this.date[n]=function(e,t){var a=new Date(e.valueOf());if(s)for(var r=0;t>r;r++)scheduler.transpose_day_week(a,s,0,i);else a.setDate(a.getDate()+t*i);return a}}else("month"==a[0]||"year"==a[0])&&(this.date[t]=function(e,t){var r=Math.ceil((12*t.getFullYear()+1*t.getMonth()-(12*e.getFullYear()+1*e.getMonth()))/i);r>=0&&e.setMonth(e.getMonth()+r*i),a[3]&&scheduler.date.day_week(e,a[2],a[3]);
    },this.date[n]=function(e,t){var r=new Date(e.valueOf());return r.setMonth(r.getMonth()+t*i),a[3]&&scheduler.date.day_week(r,a[2],a[3]),r})}
},
scheduler.repeat_date=function(e,t,a,r,n,i){
    r=r||this._min_date,n=n||this._max_date;var s=i||-1,d=new Date(e.start_date.valueOf()),l=0;for(!e.rec_pattern&&e.rec_type&&(e.rec_pattern=e.rec_type.split("#")[0]),this.transpose_type(e.rec_pattern),scheduler.date["transpose_"+e.rec_pattern](d,r);d<e.start_date||scheduler._fix_daylight_saving_date(d,r,e,d,new Date(d.valueOf()+1e3*e.event_length)).valueOf()<=r.valueOf()||d.valueOf()+1e3*e.event_length<=r.valueOf();)d=this.date.add(d,1,e.rec_pattern);
    for(;n>d&&d<e.end_date&&(0>s||s>l);){var o=scheduler.config.occurrence_timestamp_in_utc?Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),d.getHours(),d.getMinutes(),d.getSeconds()):d.valueOf(),c=this._get_rec_marker(o,e.id);if(c)a&&("none"!=c.rec_type&&l++,t.push(c));else{var _=new Date(d.valueOf()+1e3*e.event_length),h=this._copy_event(e);if(h.text=e.text,h.start_date=d,h.event_pid=e.id,h.id=e.id+"#"+Math.ceil(o/1e3),h.end_date=_,h.end_date=scheduler._fix_daylight_saving_date(h.start_date,h.end_date,e,d,h.end_date),
    h._timed=this.isOneDayEvent(h),!h._timed&&!this._table_view&&!this.config.multi_day)return;t.push(h),a||(this._events[h.id]=h,this._rec_temp.push(h)),l++}d=this.date.add(d,1,e.rec_pattern)}
},
scheduler._fix_daylight_saving_date=function(e,t,a,r,n){
    var i=e.getTimezoneOffset()-t.getTimezoneOffset();return i?i>0?new Date(r.valueOf()+1e3*a.event_length-60*i*1e3):new Date(t.valueOf()-60*i*1e3):new Date(n.valueOf())
},
scheduler.getRecDates=function(e,t){
    var a="object"==typeof e?e:scheduler.getEvent(e),r=[];
    if(t=t||100,!a.rec_type)return[{start_date:a.start_date,end_date:a.end_date}];if("none"==a.rec_type)return[];scheduler.repeat_date(a,r,!0,a.start_date,a.end_date,t);for(var n=[],i=0;i<r.length;i++)"none"!=r[i].rec_type&&n.push({start_date:r[i].start_date,end_date:r[i].end_date});return n
},
scheduler.getEvents=function(e,t){
    var a=[];for(var r in this._events){var n=this._events[r];if(n&&n.start_date<t&&n.end_date>e)if(n.rec_pattern){if("none"==n.rec_pattern)continue;var i=[];this.repeat_date(n,i,!0,e,t);
    for(var s=0;s<i.length;s++)!i[s].rec_pattern&&i[s].start_date<t&&i[s].end_date>e&&!this._rec_markers[i[s].id]&&a.push(i[s])}else this._is_virtual_event(n.id)||a.push(n)}return a
},
scheduler.config.repeat_date="%m.%d.%Y",
scheduler.config.lightbox.sections=[
    {name:"description",height:80,map_to:"text",type:"textarea",focus:!0},
    {name:"recurring", height:15, type:"recurring",map_to:"rec_type",button:"recurring"},
    {name:"time",height:72,type:"time",map_to:"auto"}],
scheduler._copy_dummy=function(e){
    var t=new Date(this.start_date),a=new Date(this.end_date);
    this.start_date=t,this.end_date=a,this.event_length=this.event_pid=this.rec_pattern=this.rec_type=null
},
scheduler.config.include_end_by=!1,scheduler.config.lightbox_recurring="ask",scheduler.attachEvent("onClearAll",function(){
    scheduler._rec_markers={},scheduler._rec_markers_pull={},scheduler._rec_temp=[]
}),
scheduler.__recurring_template=
    '<div class="dhx_form_repeat"> <form> <div class="dhx_repeat_left"> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="day" />Daily</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="week"/>Weekly</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="month" checked />Monthly</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="repeat" value="year" />Yearly</label> </div> <div class="dhx_repeat_divider"></div> <div class="dhx_repeat_center"> <div style="display:none;" id="dhx_repeat_day"> <label><input class="dhx_repeat_radio" type="radio" name="day_type" value="d"/>Every</label><input class="dhx_repeat_text" type="text" name="day_count" value="1" />day<br /> <label><input class="dhx_repeat_radio" type="radio" name="day_type" checked value="w"/>Every workday</label> </div> <div style="display:none;" id="dhx_repeat_week"> Repeat every<input class="dhx_repeat_text" type="text" name="week_count" value="1" />week next days:<br /> <table class="dhx_repeat_days"> <tr> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="1" />Monday</label><br /> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="4" />Thursday</label> </td> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="2" />Tuesday</label><br /> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="5" />Friday</label> </td> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="3" />Wednesday</label><br /> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="6" />Saturday</label> </td> <td> <label><input class="dhx_repeat_checkbox" type="checkbox" name="week_day" value="0" />Sunday</label><br /><br /> </td> </tr> </table> </div> <div id="dhx_repeat_month"> <label><input class="dhx_repeat_radio" type="radio" name="month_type" value="d"/>Repeat</label><input class="dhx_repeat_text" type="text" name="month_day" value="1" />day every<input class="dhx_repeat_text" type="text" name="month_count" value="1" />month<br /> <label><input class="dhx_repeat_radio" type="radio" name="month_type" checked value="w"/>On</label><input class="dhx_repeat_text" type="text" name="month_week2" value="1" /><select name="month_day2"><option value="1" selected >Monday<option value="2">Tuesday<option value="3">Wednesday<option value="4">Thursday<option value="5">Friday<option value="6">Saturday<option value="0">Sunday</select>every<input class="dhx_repeat_text" type="text" name="month_count2" value="1" />month<br /> </div> <div style="display:none;" id="dhx_repeat_year"> <label><input class="dhx_repeat_radio" type="radio" name="year_type" value="d"/>Every</label><input class="dhx_repeat_text" type="text" name="year_day" value="1" />day<select name="year_month"><option value="1" selected >January<option value="2">February<option value="3">March<option value="4">April<option value="5">May<option value="6">June<option value="7">July<option value="8">August<option value="9">September<option value="10">October<option value="11">November<option value="12">December</select>month<br /> <label><input class="dhx_repeat_radio" type="radio" name="year_type" checked value="w"/>On</label><input class="dhx_repeat_text" type="text" name="year_week2" value="1" /><select name="year_day2"><option value="1" selected >Monday<option value="2">Tuesday<option value="3">Wednesday<option value="4">Thursday<option value="5">Friday<option value="6">Saturday<option value="7">Sunday</select>of<select name="year_month2"><option value="0" selected >January<option value="1">February<option value="2">March<option value="3">April<option value="4">May<option value="5">June<option value="6">July<option value="7">August<option value="8">September<option value="9">October<option value="10">November<option value="11">December</select><br /> </div> </div> <div class="dhx_repeat_divider"></div> <div class="dhx_repeat_right"> <label><input class="dhx_repeat_radio" type="radio" name="end" checked/>No end date</label><br /> <label><input class="dhx_repeat_radio" type="radio" name="end" />After</label><input class="dhx_repeat_text" type="text" name="occurences_count" value="1" />occurrences<br /> <label><input class="dhx_repeat_radio" type="radio" name="end" />End by</label><input class="dhx_repeat_date" type="text" name="date_of_end" value="'+scheduler.config.repeat_date_of_end+'" /><br /> </div> </form> </div> <div style="clear:both"> </div>';
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_recurring.js.map