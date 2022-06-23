// Enter an API key from the Google API Console:
//   https://console.developers.google.com/apis/credentials
const API_KEY = 'AIzaSyAyWasY-eV_vuBMx-AdzsduZLaqMrFIIUI';

// Enter the API Discovery Docs that describes the APIs you want to
// access. In this example, we are accessing the People API, so we load
// Discovery Doc found here: https://developers.google.com/people/api/rest/
const DISCOVERY_DOC = ["https://people.googleapis.com/$discovery/rest?version=v1"];

// Enter a client ID for a web application from the Google API Console:
//   https://console.developers.google.com/apis/credentials?project=_
// In your API Console project, add a JavaScript origin that corresponds
//   to the domain where you will be running the script.
const CLIENT_ID = '544624673607-7upat5jn4oenk0j5cult3pv9dhp4jq2m.apps.googleusercontent.com';

// Enter one or more authorization scopes. Refer to the documentation for
// the API or https://developers.google.com/people/v1/how-tos/authorizing
// for details.
const SCOPES = 'profile https://www.googleapis.com/auth/drive.appdata';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout');

class Payload {
    id = ""
    constructor(filename, data) {
        this.filename = filename
        this.data = data
    }
}


const CONFIG = new Payload("config_profile_v2.json",  {show_completed:false})
const TASK = new Payload("current_task.json", [])

function handle_client_load() {
    // Load the API client and auth2 library
    gapi.load('client:auth2', init_client);
}

function init_client() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOC,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(update_sign_in_status);

        // Handle the initial sign-in state.
        update_sign_in_status(gapi.auth2.getAuthInstance().isSignedIn.get());

        authorizeButton.onclick = handle_auth_click;
        signoutButton.onclick = handle_signout_click;
    });
}

function list_files() {
    gapi.client.load('drive', 'v3', function () {
        gapi.client.drive.files.list({
            'spaces': 'appDataFolder',
            'pageSize': 100,
            'fields': "nextPageToken, files(*)"
        }).then(function(response) {
            console.log(response)
    })})
}

//load first
async function update_sign_in_status(isSignedIn) {

    if (isSignedIn) {
        $("#signin").hide()
        $("#signout").show()
        $("#signinModal").modal('hide');
       // get_my_info();
        await load_data(TASK);
        await load_data(CONFIG)
        console.log("loaded file data")
        console.log(TASK)
        console.log("load config data")
        console.log(CONFIG)
        list_files();
        make_todolist(TASK.data)
        set_config(CONFIG.data)
    } else {
        clear_todolist()
        $("#signin").show()
        $("#signout").hide()
        $("#hello").empty()
        $("#signinModal").modal('show');
        show_nav();
    }
}

async function load_data(payload) {
    console.log("exist file: ")
    let resp = await get_file_by_name(payload.filename, "id")
    console.log(resp.result.files)
    if (resp.result.files.length === 0) {
        payload.id = (await create_file(payload.data, payload.filename)).id
        console.log("save file: ")
        console.log(payload)
    } else {
        payload.id = resp.result.files[0].id
        payload.data = await get_file_by_id(payload.id)
    }
}

async function get_file_by_name(filename, fields) {
    return new Promise( (resolve)  => {
            gapi.client.load('drive', 'v3', () => {
                    gapi.client.drive.files.list({
                        'q': "name= \'" + filename + "\'",
                        'spaces': 'appDataFolder',
                        'fields': "files("+fields+")"
                    }).then(resolve)
                }
            )
        }
    )
}


async function get_file_by_contains_name(filename, fields) {
    return new Promise( (resolve)  => {
            gapi.client.load('drive', 'v3', () => {
                    gapi.client.drive.files.list({
                        'q': "name contains \'" + filename + "\'",
                        'orderBy': 'name desc',
                        'spaces': 'appDataFolder',
                        'fields': "files("+fields+")"
                    }).then(resolve)
                }
            )
        }
    )
}

async function get_file_by_id(id) {
    return new Promise((resolve) => {
            gapi.client.load('drive', 'v3', () => {
                gapi.client.drive.files.get(
                    {fileId: id, alt: 'media'}
                ).then(function (response) {
                    resolve(JSON.parse(response.body))
                    // response.body has the file data
                }, function (reason) {
                    alert(`Failed to get file: ${reason}`);
                });
                }
            )
        }
    )
}

function handle_auth_click(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handle_signout_click(event) {
    gapi.auth2.getAuthInstance().signOut();
}


async function create_file(data, filename) {

    let metadata = {
        'name': filename, // Filename at Google Drive
        'mimeType': 'application/json', // mimeType at Google Drive
        'parents': ['appDataFolder'], // Folder ID at Google Drive
    };

    let accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
    let form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', new Blob([JSON.stringify(data)], {type: 'application/json'}));

    let response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
        method: 'POST',
        headers: new Headers({'Authorization': 'Bearer ' + accessToken}),
        body: form,
    });
    return await response.json()
}

function update_file(payload) {
    console.log("update_file")
    console.log(payload)
    console.log(payload.id)
    let accessToken = gapi.auth.getToken().access_token;
    const url = 'https://www.googleapis.com/upload/drive/v3/files/'+payload.id+'?uploadType=media';
    fetch(url, {
        method: 'PATCH',
        headers: new Headers({
            Authorization: 'Bearer ' + accessToken,
            'Content-type': 'application/json'
        }),
        body: JSON.stringify(payload.data)
    })
        .then(result => result.json())
        .then(value => {
            console.log('Updated. Result:\n' + JSON.stringify(value, null, 2));
        })
        .catch(err => console.error(err))
}

// Load the API and make an API call.  Display the results on the screen.
function get_my_info() {
    gapi.client.people.people.get({
        'resourceName': 'people/me',
        'requestMask.includeField': 'person.names'
    }).then(function(resp) {
        let p = document.createElement('p');
        let name = resp.result.names[0].givenName;
        p.appendChild(document.createTextNode('Hello, '+name+'!'));
        document.getElementById('hello').appendChild(p);
    });
}

