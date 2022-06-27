let count_done = 0;
let count_open = 0;
let height_def = $(window).height;
const DEBUG = false;
const SAVE_CURRENT_TODO_EVENT = new CustomEvent("save-current-todo-event")
const SAVE_CURRENT_TODO_TO_HISTORY_EVENT = new CustomEvent("save-current-todo-to-history-event")
const SHOW_HISTORY_EVENT = new CustomEvent("show-history-event")
const SAVE_CONFIG_EVENT = new CustomEvent("save-config-event")
let show_completed = true;
//when write text
$('#todo').on("click", 'div[name="text"]', function (data) {
    $(this).prop('contenteditable', true).focus();
}).on('keydown', 'div[name="text"]', function (e) {
    if (e.which == 13 && !e.shiftKey) {
        if ($(this).html().length == 0) {
            $(this).html("\xa0");
        }
        $(this).prop('contenteditable', false);
        let nt = newtask();
        let li = $(this).parents('li');
        if(DEBUG) console.log(li)
        li.after(nt);
        $(li.next(li)).find('div[name="text"]')
            .prop('contenteditable', true).focus();
        window.scrollTo(0, document.body.scrollHeight);
        return false;
    }


}).on('focusout', 'div[name="text"]', function (data) {
    if ($(this).html().length == 0) {
        $(this).html("\xa0");
    }

    $(this).prop('contenteditable', false);
    $(this).html(linkify($(this).text()))
    document.dispatchEvent(SAVE_CURRENT_TODO_EVENT)
});

//when click on status
$('#todo').on('click', 'div[name="status"]', function () {
    let li = $(this).parent();

    if (li.attr('done') == 'true') {
        li.attr('done', 'false');
        li.removeClass('d-none');
        li.find("div[name='completed']")
            .html("--:--")
            .attr('raw','--:--')
        ;
        $('#count_done').html(--count_done);
        $('#count_open').html(++count_open);

    } else {
        li.attr('done', 'true');
        let time = get_current_time();
        li.find("div[name='completed']")
            .html(format_time(time))
            .attr('raw',time)
        if (!show_completed) {
            li.addClass('d-none');
        }
        $('#count_done').html(++count_done);
        $('#count_open').html(--count_open);
    }

    document.dispatchEvent(SAVE_CURRENT_TODO_EVENT)
});

//when click on trash
$('#todo').on('click', 'div[name="trash"]', function () {
    let li = $(this).parents()[3];
    if(DEBUG)console.log(li);
    if ($(li).attr('done') == 'true') {
        $('#count_done').html(--count_done);
    } else {
        $('#count_open').html(--count_open);
    }
    li.remove();
    document.dispatchEvent(SAVE_CURRENT_TODO_EVENT)
});

function f_show_completed() {
    if (!show_completed) {
        $('#todo li').map(function () {
            if ($(this).attr('done') == 'true') {
                $(this).addClass('d-none');
            }
        })
        $('#show_completed').attr('src', 'img/lp2.svg');
    } else {
        $('#todo li').map(function () {
            if ($(this).attr('done') == 'true') {
                $(this).removeClass('d-none');
            }
        })
        $('#show_completed').attr('src', 'img/lp_on2.svg');
    }
}

//when set checkbox 'show completed tasks'
$('#show_completed').on('click', function () {
    show_completed = ! show_completed;
    f_show_completed();
    document.dispatchEvent(SAVE_CONFIG_EVENT)
});


//when click "new task"
$('#newtask').on('click', function () {
    let nt = newtask();
    $('#todo ul').append(nt);
    $("#todo li:last-child div[name='text']").prop('contenteditable', true).focus();
    window.scrollTo(0, document.body.scrollHeight);
    document.dispatchEvent(SAVE_CURRENT_TODO_EVENT)
});


//when click "new todolist"
$("#newtodo").on('click', async function () {
    clear_todolist()
    document.dispatchEvent(SAVE_CURRENT_TODO_TO_HISTORY_EVENT)
    document.dispatchEvent(SAVE_CURRENT_TODO_EVENT)
});

//when click "sign in"
$("#signin").on('click', function () {
    $("#signinModal").modal('show');
});

//when click "history"
$("#histroy").on('click', function () {
    document.dispatchEvent(SHOW_HISTORY_EVENT)
    $("#histroyModal").modal('show');
});

function newtask() {
    let time = get_current_time();
    let data = {desc: '\xa0', created: time, completed: "--:--", done: 'false'};
    if(DEBUG)console.log(time);
    return task(data);
}

//when scroll
let last_scroll_top = 0;
$(window).scroll(function (event) {

        let st = $(this).scrollTop();
        if (DEBUG) console.log("st: " + last_scroll_top);
        if (DEBUG) console.log("scrolTop: " + st);

        if ((st + $(window).height() > $(document).height() - 100) || st > last_scroll_top || st == 0) {
            // downscroll code
            show_scroll_nav();
        } else  {
            hide_scroll_nav();
            // upscroll code
        }
        last_scroll_top = st;
});

$(window).resize(function (event) {
    if(DEBUG)console.log(" height: "+ $( window ).height());
    if(DEBUG)console.log(" wight: "+ $( window ).width());
    if(DEBUG)console.log(" ratio: "+  $( window ).height()/$( window ).width());
    if(isMobileVersion()) {
       if ($(window).height() / $(window).width() < 1.5) {
           hide_top_nav();
           hide_nav();
       } else  {
           show_top_nav();
           show_nav();
           show_scroll_nav();
       }
    }
});


function show_nav() {
    $('#bottom_nav').css({'visibility': ""});
    $('#newtask').css({'visibility': ""});
}

function hide_nav() {
    $('#newtask').css({'visibility': "hidden"});
    $('#bottom_nav').css({'visibility': "hidden"});

}

function show_scroll_nav() {
    $('#bottom_nav').css({bottom: "0px"});
    $('#newtask').css({bottom: "-25px"});
}

function hide_scroll_nav() {
    $('#newtask').css({bottom: "-100px"});
    $('#bottom_nav').css({bottom: "-100px"});
}

function hide_top_nav() {
    $('#top_nav').css({'visibility': "hidden"});
    $('#top_bar').css({'visibility': "hidden"});
}

function show_top_nav() {
    $('#top_nav').css({'visibility': ''});
    $('#top_bar').css({'visibility': ''});
}


//create new task
function task(data) {
    //let completed = ''
    if (data.done == 'true') {
        $('#count_done').html(++count_done);
    } else {
        $('#count_open').html(++count_open);
    }
    let li = `<li class="media mt-3" done="${data.done}">
                    <div name="status"></div>
                    <div class="media-body">
                        <div name="text">${linkify(data.desc)}</div>
                        <div>
                            <hr class="my-1 border-white">
                            <div class="row justify-content-end">
                                <div name="created" raw="${data.created}">${format_time(data.created)} → </div>
                                &nbsp;<div name="completed" raw="${data.completed}">${format_time(data.completed)}</div>
                                <div name="trash" ></div>
                            </div>
                        </div>
                    </div>
                </li>`;
    return li;
}

//function read task
function get_task() {
    let data = []
    let li_list = $('#todo li');
    for (i = 0; i < li_list.length; i++) {
        data.push({
            desc: $(li_list[i] ).find("div[name*=text]").text(),
            created: $(li_list[i] ).find("div[name*=created]").attr("raw"),
            completed: $(li_list[i] ).find("div[name*=completed]").attr("raw"),
            done: $(li_list[i]).attr('done')
        })
    }
    if(DEBUG)console.log("get_task\n:" + li_list[i]);
    if(DEBUG)console.log(data);
    return data
}


function get_current_time() {
    return moment().format();
}

function format_time(time) {
    let result = moment(time).format("HH:mm");
    if (result == "Invalid date") {
        result = "--:--"
    }
    return result;
}

async function clear_todolist() {
    $('#todo ul').html("");
    count_done = 0;
    count_open = 0;
    $('#count_done').html(0);
    $('#count_open').html(0);
    await new Promise(r => setTimeout(show_nav, 300));
}

function make_todolist(data) {
    if(data.length === 0) {
        return
    }
    let ul = $('#todo ul');
    for (i = 0; i < data.length; i++) {
        ul.append(task(data[i]));
    }
}
//set config
function set_config(data) {
    show_completed = data.show_completed
    f_show_completed()
}

$(function () {
    $('input, select').on('focus', function () {
        $(this).parent().find('.input-group-text').css('border-color', '#80bdff');
    });
    $('input, select').on('blur', function () {
        $(this).parent().find('.input-group-text').css('border-color', '#ced4da');
    });
});

function poll() {
    $.ajax({
        url: "serv", data: {action: "poll"}, success: function (data) {
            //Update your dashboard gauge

        }, dataType: "json", complete: poll, timeout: 30000
    });
}

function linkify(inputText) {
    let replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}

function isMobileVersion() {
   return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))
}

