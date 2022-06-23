let count_done = 0;
let count_open = 0;
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
        //console.log(li)
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
    //console.log(li);
    if ($(li).attr('done') == 'true') {
        $('#count_done').html(--count_done);
    } else {
        $('#count_open').html(--count_open);
    }
    li.remove();
    show_nav();
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
    show_nav();
});

//when click "history"
$("#histroy").on('click', function () {
    document.dispatchEvent(SHOW_HISTORY_EVENT)
    $("#histroyModal").modal('show');
    show_nav();
});

function newtask() {
    let time = get_current_time();
    let data = {desc: '\xa0', created: time, completed: "--:--", done: 'false'};
    console.log(time);
    return task(data);
}

//when scroll
var last_scroll_top = 0;
$(window).scroll(function (event) {
    var st = $(this).scrollTop();
    if (st > last_scroll_top) {
        // downscroll code
        show_nav();
    } else {
        hide_nav();
        // upscroll code
    }
    last_scroll_top = st;
});


function show_nav() {
    $('#bottom_nav').css({bottom: "0px"});
    $('#newtask').css({bottom: "-25px"});

}

function hide_nav() {
    $('#newtask').css({bottom: "-100px"});
    $('#bottom_nav').css({bottom: "-100px"});
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
    console.log("get_task\n:" + li_list[i]);
    console.log(data);
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
function check() {
    console.log("hello source")
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

