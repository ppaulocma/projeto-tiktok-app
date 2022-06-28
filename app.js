// This will use the demo backend if you open index.html locally via file://, otherwise your server will be used
//let backendUrl = 'file:///C:/Users/Paulo%20Cesar/Desktop/Projeto%20TikTok/TikTok-Live-Connector/';
//let backendUrl = "https://projeto-tiktok.herokuapp.com/";
let backendUrl = "https://tiktok-chat-reader.zerody.one/";
let connection = new TikTokIOConnection(backendUrl);

// Counter
let viewerCount = 0;
let likeCount = 0;
let diamondsCount = 0;
let bolsonaro = 1;
let lula = 1;

$(document).ready(() => {
    $('#connectButton').click(connect);
    $('#uniqueIdInput').on('keyup', function (e) {
        if (e.key === 'Enter') {
            connect();
        }
    });
})

function connect() {
    let uniqueId = $('#uniqueIdInput').val();
    if (uniqueId !== '') {

        $('#stateText').text('Connecting...');

        connection.connect(uniqueId, {
            enableExtendedGiftInfo: true
        }).then(state => {
            $('#stateText').text(`Connected to roomId ${state.roomId}`);

            // reset stats
            viewerCount = 0;
            likeCount = 0;
            diamondsCount = 0;
            updateRoomStats();

        }).catch(errorMessage => {
            $('#stateText').text(errorMessage);
        })

    } else {
        alert('no username entered');
    }
}

// Prevent Cross site scripting (XSS)
function sanitize(text) {
    return text.replace(/</g, '&lt;')
}

function updateRoomStats() {
    $('#roomStats').html(`Viewers: <b>${viewerCount.toLocaleString()}</b> Likes: <b>${likeCount.toLocaleString()}</b> Earned Diamonds: <b>${diamondsCount.toLocaleString()}</b>`)
}

function generateUsernameLink(data) {
    return `<a class="usernamelink" href="https://www.tiktok.com/@${data.uniqueId}" target="_blank">${data.uniqueId}</a>`;
}

function isPendingStreak(data) {
    return data.giftType === 1 && !data.repeatEnd;
}

/**
 * Add a new message to the chat container
 */
function addChatItem(color, data, text, summarize) {
    let container = $('.chatcontainer');

    if (container.find('div').length > 500) {
        container.find('div').slice(0, 200).remove();
    }

    container.find('.temporary').remove();;

    container.append(`
        <div class=${summarize ? 'temporary' : 'static'}>
            <img class="miniprofilepicture" src="${data.profilePictureUrl}">
            <span>
                <b>${generateUsernameLink(data)}:</b> 
                <span style="color:${color}">${sanitize(text)}</span>
            </span>
        </div>
    `);

    container.stop();
    container.animate({
        scrollTop: container[0].scrollHeight
    }, 400);
}

/**
 * Add a new gift to the gift container
 */
function addGiftItem(data) {
    let container = $('.giftcontainer');

    if (container.find('div').length > 200) {
        container.find('div').slice(0, 100).remove();
    }

    let streakId = data.userId.toString() + '_' + data.giftId;

    let html = `
        <div data-streakid=${isPendingStreak(data) ? streakId : ''}>
            <img class="miniprofilepicture" src="${data.profilePictureUrl}">
            <span>
                <b>${generateUsernameLink(data)}:</b> <span>${data.describe}</span><br>
                <div>
                    <table>
                        <tr>
                            <td><img class="gifticon" src="${data.giftPictureUrl}"></td>
                            <td>
                                <span>Name: <b>${data.giftName}</b> (ID:${data.giftId})<span><br>
                                <span>Repeat: <b style="${isPendingStreak(data) ? 'color:red' : ''}">x${data.repeatCount.toLocaleString()}</b><span><br>
                                <span>Cost: <b>${(data.diamondCount * data.repeatCount).toLocaleString()} Diamonds</b><span>
                            </td>
                        </tr>
                    </tabl>
                </div>
            </span>
        </div>
    `;

    let existingStreakItem = container.find(`[data-streakid='${streakId}']`);

    if (existingStreakItem.length) {
        existingStreakItem.replaceWith(html);
    } else {
        container.append(html);
    }

    container.stop();
    container.animate({
        scrollTop: container[0].scrollHeight
    }, 800);
}


// viewer stats
connection.on('roomUser', (msg) => {
    if (typeof msg.viewerCount === 'number') {
        viewerCount = msg.viewerCount;
        
    }
})

// like stats
connection.on('like', (msg) => {
    if (typeof msg.likeCount === 'number') {
    }

    if (typeof msg.totalLikeCount === 'number') {
        likeCount = msg.totalLikeCount;
    }
})

// Member join
let joinMsgDelay = 0;
connection.on('member', (msg) => {
    
})

// New chat comment received
connection.on('chat', (msg) => {
})

// New gift received
connection.on('gift', (data) => {

    if (data.giftName == 'Rose') {
        bolsonaro++;
    } else if(data.giftName == "TikTok"){
        lula++;
    }
    
    let total =  bolsonaro + lula;

    let percentBolsonaro = ((bolsonaro * 100) / total).toFixed(0);
    let percentLula = ((lula * 100) / total).toFixed(0);

    $('.progress-bar1').attr('style', `--progress1:${percentBolsonaro}`)
    $('.progress-bar2').attr('style', `--progress2:${percentLula}`)
    $('.percent1').text(`${percentBolsonaro}%`)
    $('.percent2').text(`${percentLula}%`)
    $('.bolsonaroCount').html(`${bolsonaro} <br> Votos`);
    $('.lulaCount').html(`${lula} <br> Votos`);

})

// share, follow
connection.on('social', (data) => {
})

connection.on('streamEnd', () => {
    console.log(`live acabou`)
})