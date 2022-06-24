

//get tasks
function history_table(date) {
    let table = `<table class="table table-bordered table-dark">
                    <thead>
                    <tr class="bg-success">
                        <th scope="col" colspan="2" class="col-md-11">${date}</th>
                        <th scope="col" class="col-md-1"><input type="checkbox"></th>
                    </tr>
                    </thead>
                    <tbody>
                    </tbody>
                    </table>`
    return table;
}

function history_tr(data) {
    let tr =
        `<tr done="${data.done}">
    <th scope="row"><div></div></th>
    <td>${data.desc}</td>
    <td><input type="checkbox"></td>
    </tr>`
    return tr;
}

function format_date(date) {
    return moment(date).format("DD.MM.YYYY");
}

function fill_history_todolist(data) {
    let div = $('#histroy_todo');
    for (i = 0; i < data.length; i++) {
        div.append(history_table(data[i].date));
        let tbody = $('#histroy_todo tbody').eq(i);
        for (j = 0; j < data[i].todo.length; j++) {
            tbody.append(history_tr(data[i].todo[j]));
        }
    }
}

function clear_history_todolist() {
    $('#histroy_todo').html("");
}

function unselect() {
    let input = $('#histroy_todo table tr input:checked');
    if(DEBUG)console.log(input)
    for(i = 0 ; i < input.length; i++) {
        input[i].checked = false;
    }
    let badge = $("#histroyModal button.btn.btn-primary span.badge.badge-light");
    badge.html(0);
}

//when click on general checkbox
$("#histroy_todo").on('change', 'thead input[type=checkbox]', function() {

    if(this.checked) {
      let task =  select_all(this, true);
      inc_task(task);
    } else {
        let task = select_all(this, false);
        dec_task(task);
    }
});

//when click on checkbox
$("#histroy_todo").on('change', 'tbody input[type=checkbox]', function() {
    if(this.checked) {
        inc_task(1);
    } else {
        dec_task(1);
    }
});

function select_all(parent, flag) {
    let tr = $(parent).closest('table').children('tbody').children('tr');
    let count = 0;
    for(i = 0 ; i < tr.length; i++) {
        let t = $(tr[i]).find('input[type=checkbox]');

        if(!t[0].checked && flag) {
            count++;
        }
        if(t[0].checked && !flag) {
            count++;
        }
        t.prop('checked', flag);
    }
    return count;
}

function get_selected_task() {
    let time = get_current_time();
    let tasks = $('#histroy_todo table tbody tr input:checked').parent().prev();
    let data = [];
    for(i = 0; i < tasks.length; i++) {
        data.push(
            {desc: tasks[i].innerText, created: time, completed: "--:--", done: 'false'}
        );
    }
    return data;
}

//test data
/*var lastTodo = [
    [
        {desc: "some text1", created: "2020-06-19T19:38:22+03:00", completed: "--:--", done: 'false'},
        {
            desc: "some text2",
            created: "2020-06-19T14:33:22+03:00",
            completed: "2020-06-19T15:33:22+03:00",
            done: 'true'
        },
        {
            desc: "some text2",
            created: "2020-06-19T14:33:22+03:00",
            completed: "2020-06-19T15:33:22+03:00",
            done: 'true'
        },
        {
            desc: "some text2",
            created: "2020-06-18T14:33:22+03:00",
            completed: "2020-06-18T15:33:22+03:00",
            done: 'true'
        },
        {
            desc: "some text2",
            created: "2020-06-18T14:33:22+03:00",
            completed: "2020-06-18T15:33:22+03:00",
            done: 'true'
        },
        {
            desc: "some text2",
            created: "2020-06-18T14:33:22+03:00",
            completed: "2020-06-18T15:33:22+03:00",
            done: 'true'
        },
        {desc: "some text2", created: "2020-06-18T14:33:22+03:00", completed: "--:--", done: 'false'},
        {desc: "some text2", created: "2020-06-18T14:33:22+03:00", completed: "--:--", done: 'false'},
    ], [
        {desc: "some text2", created: "2020-06-17T14:33:22+03:00", completed: "--:--", done: 'false'},
        {
            desc: "some text2 some text2some text2some text2some text2some text2",
            created: "2020-06-17T14:33:22+03:00",
            completed: "2020-06-17T16:33:22+03:00",
            done: 'true'
        },
        {desc: "some text2", created: "2020-06-17T14:33:22+03:00", completed: "--:--", done: 'false'},
        {desc: "some text2", created: "2020-06-17T14:33:22+03:00", completed: "--:--", done: 'false'},
        {
            desc: "some text2",
            created: "2020-06-17T14:33:22+03:00",
            completed: "2020-06-17T16:33:22+03:00",
            done: 'true'
        },
        {desc: "some text2", created: "2020-06-17T14:33:22+03:00", completed: "--:--", done: 'false'},
    ], [
        {desc: "some text2", created: "2020-06-01T14:33:22+03:00", completed: "--:--", done: 'false'},
        {
            desc: "some text2",
            created: "2020-06-01T14:33:22+03:00",
            completed: "2020-06-01T18:33:22+03:00",
            done: 'true'
        },
        {desc: "some text3", created: "2020-06-01T16:12:22+03:00", completed: "2020-06-01T18:12:22+03:00", done: 'true'}
    ]
];*/

function inc_task(count) {
    let badge = $("#histroyModal button.btn.btn-primary span.badge.badge-light");
    badge.html( parseInt(badge.html()) + count);
}

function dec_task(count) {
    let badge = $("#histroyModal button.btn.btn-primary span.badge.badge-light");
    badge.html( parseInt(badge.html()) - count);
}
//when click add button
$("#histroyModal button.btn.btn-primary").on('click', function () {
    let data = get_selected_task();
    if(data.length != 0) {
        make_todolist(data);
        unselect();
    }

})
//when click close button
$("#histroyModal button.btn.btn-secondary").on('click', function () {

})
//when click uncheck button
$("#histroyModal button.btn.btn-secondary.ml-2.mr-2").on('click', function () {
    unselect();
})


//fill_history_todolist(lastTodo);
