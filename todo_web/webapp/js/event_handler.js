document.addEventListener("save-current-todo-event", function (e){
    TASK.data = get_task()
    update_file(TASK)
})

document.addEventListener("save-config-event", function (e){
    CONFIG.data.show_completed = show_completed
    update_file(CONFIG)
})


document.addEventListener("save-current-todo-to-history-event",
   async function (e) {
        if(TASK.data.length == 0) {
            return
        }
        let max = moment.max(TASK.data.map(i => moment(i.created)))
        let data = {
            date : format_date(max),
            todo: TASK.data
        }
        console.log(data)
        let filename = `history_${max.valueOf()}.json`
        console.log("filename: " + filename)
        await create_file(data, filename)
    })

document.addEventListener("show-history-event",
    async function (e) {
    //return list history
    let history_meta_list = JSON.parse((await get_file_by_contains_name('history', 'id, name')).body)
    console.log("history files:")
    console.log(history_meta_list)
    let history_todo_list = await Promise.all( history_meta_list.files.map( obj => get_file_by_id( obj.id)))
    console.log(history_todo_list)
    //clear history
    clear_history_todolist()
    //fill history
    fill_history_todolist(history_todo_list)
})