// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: subway;



// Traewelling Global Widget
// Author: tiuub
// License: Apache 2.0
// GitHub: https://github.com/tiuub/traewelling-global-widget/
// 
// Date: 2023-08-07



// Tips: If you want to tip me, please use GitHub Sponsors in my GitHub Profile
// Link: https://github.com/sponsors/tiuub


 
// Have fun with the widget 😺

const VERSION = 'v1.0';
const githubRepo = "https://github.com/tiuub/traewelling-global-widget"
const areRepoUpdatesAvailable = await checkRepoUpdates();
console.log("Update available: " + areRepoUpdatesAvailable)



// changable parameters
const maxLeaderboardUsers = 7;
const maxLatestTrips = 7;
const defaultUser = "Gertrud123"



if (config.runsInWidget) {
  Script.setWidget(await createWidget())
} else {
  let w = await createWidget()
  w.presentLarge()
}

Script.complete()

async function createWidget() {
  let username = args.widgetParameter
  if (!username)
    username = defaultUser
    
    
  // Create widget
  let widget = new ListWidget()
  widget.backgroundColor = new Color("#811a0e")
  if (areRepoUpdatesAvailable)
    widget.url = githubRepo + "/releases/latest"
  else
    widget.url = `https://traewelling.de/@${username}`
  
  
  switch(config.widgetFamily) {
    case "small":
      await addUserToWidget(username, widget)
      
      break;
    case "medium":
      main = widget.addStack()
  
      user = main.addStack()
      user.layoutVertically()
      user.centerAlignContent()
      await addUserToWidget(username, user)
      
      main.addSpacer()
      
      leaderboard = main.addStack()
      leaderboard.layoutVertically()
      leaderboard.centerAlignContent()
      await addLeaderboardByDistanceToWidget(leaderboard)
    
      break;
    default:
      main = widget.addStack()
      main.layoutVertically()
      main.topAlignContent()
      
      row1 = main.addStack()
      
      user = row1.addStack()
      user.layoutVertically()
      user.topAlignContent()
      await addUserToWidget(username, user)
      
      row1.addSpacer()
      
      leaderboard = row1.addStack()
      leaderboard.layoutVertically()
      leaderboard.topAlignContent()
      await addLeaderboardByDistanceToWidget(leaderboard)
      
      main.addSpacer()
      
      row2 = main.addStack()
      
      latest_trip = row2.addStack()
      latest_trip.layoutVertically()
      latest_trip.topAlignContent()
      await addLatestTripToWidget(latest_trip, username)

      break;
  }
  
  return widget
}

async function addLeaderboardByDistanceToWidget(widget) {
  
  let leaderboard = await loadLeaderboard("distance")
  
  let data = leaderboard["data"]
  
  t_leaderboard = widget.addText("Top Traewellers")
  t_leaderboard.font = Font.boldSystemFont(12)
  t_leaderboard.textColor  = Color.white()
  
  for (let i = 0; i < maxLeaderboardUsers; i++) {
    username = data[i]["username"]
    let trainDistance = data[i]["trainDistance"]
    let trainDistanceInKm = (trainDistance/1000)
    
    widget.addSpacer(3)
    
    t_user = widget.addText(`${place_emoji(i + 1)} ${username} ~ ${numberWithCommas(trainDistanceInKm, 0)} km`)
    t_user.font = Font.regularSystemFont(12)
    t_user.textColor = Color.white()
  }
}

async function addLeaderboardByPointsToWidget(widget) {
  
  let leaderboard = await loadLeaderboard("")
  
  let data = leaderboard["data"]
  
  t_leaderboard = widget.addText("Top Traewellers")
  t_leaderboard.font = Font.boldSystemFont(12)
  t_leaderboard.textColor  = Color.white()
  
  for (let i = 0; i < 5; i++) {
    username = data[i]["username"]
    let points = data[i]["points"]
    
    widget.addSpacer(3)
    
    t_user = widget.addText(`${place_emoji(i + 1)} ${username} ~ ${points} points`)
    t_user.font = Font.regularSystemFont(12)
    t_user.textColor = Color.white()
  }
}

async function addLatestTripToWidget(widget, username) {
  t_title = widget.addText("Latest Trips")
  t_title.font = Font.boldSystemFont(12)
  t_title.textColor  = Color.white()
  
  let trips = await loadLatestTrips(username)
  
  let data = trips["data"]
  
  if (data === undefined || data.length <= 0) {
    widget.addSpacer(3)
    
    t_trip = widget.addText("😿 No train rides")
    t_trip.font = Font.regularSystemFont(12)
    t_trip.textColor = Color.white()
    return;
  }
  
  l = data.length
  if (l > maxLatestTrips) {
    l = maxLatestTrips
  }
  
  for (let i = 0; i < l; i++) {
    let trainCategory = data[i]["train"]["category"]
    let trainDistance = data[i]["train"]["distance"]
    let trainDistanceInKm = (trainDistance/1000)
    let trainOriginName = data[i]["train"]["origin"]["name"]
    let trainDestinationName = data[i]["train"]["destination"]["name"]
    
    widget.addSpacer(3)
    
    t_trip = widget.addText(`${train_emoji(trainCategory)} ${trainOriginName} to ${trainDestinationName} ~ ${numberWithCommas(trainDistanceInKm, 0)} km`)
    t_trip.font = Font.regularSystemFont(12)
    t_trip.textColor = Color.white()
  }
}

async function addUserToWidget(username, widget, scale = 1) {
  let title = "🚆 Traewelling"
  if (areRepoUpdatesAvailable)
    title = "🔄 Traewelling"
  
  t_title = widget.addText(title)
  t_title.font = Font.boldSystemFont(12)
  t_title.textColor  = Color.white()
  
  let user = await loadUser(username)
  
  let data = user["data"]
  
  if (data === undefined) {
    t_subtitle = widget.addText(`${username} not found`)
    t_subtitle.font = Font.regularSystemFont(12 * scale)
    t_subtitle.textColor  = Color.white()
    return
  }
  
  let displayName = data["displayName"]
  let trainDistance = data["trainDistance"]
  let trainDistanceInKm = (trainDistance/1000)
  let trainDuration = data["trainDuration"]
  let trainDurationHoursMinutes = toHoursAndMinutes(trainDuration)
  let trainDurationHours = trainDurationHoursMinutes["hours"]
  let trainDurationMinutes = trainDurationHoursMinutes["minutes"]
  let points = data["points"]
  
  let subtitle = `stats for ${displayName}`
  if (areRepoUpdatesAvailable)
    subtitle = "update available"
  
  t_subtitle = widget.addText(subtitle)
  t_subtitle.font = Font.regularSystemFont(12 * scale)
  t_subtitle.textColor  = Color.white()
  
  widget.addSpacer(20)
  
  t_distance = widget.addText(numberWithCommas(trainDistanceInKm, 0) + " km")
  t_distance.font = Font.boldSystemFont(18 * scale)
  t_distance.textColor  = Color.white()
  
  t1_distance = widget.addText("total distance")
  t1_distance.font = Font.boldSystemFont(12 * scale)
  t1_distance.textColor  = Color.white()
  
  widget.addSpacer(20)
  
  t_duration = widget.addText(`⏱️ ${trainDurationHours}h ${trainDurationMinutes}min`)
  t_duration.font = Font.regularSystemFont(12 * scale)
  t_duration.textColor = Color.white()
  
  widget.addSpacer(3)
  
  t_points = widget.addText(`🏆 ${points} points`)
  t_points.font = Font.regularSystemFont(12 * scale)
  t_points.textColor = Color.white()
}

async function loadUser(username) {
  console.log("Fetching user, username: " + username)
  let url = "https://traewelling.de/api/v1/user/" + username
  let req = new Request(url)
  let json = await req.loadJSON()
  return json
}

async function loadLeaderboard(category) {
  console.log("Fetching leaderboard, category: " + category)
  let url = "https://traewelling.de/api/v1/leaderboard/" + category
  let req = new Request(url)
  let json = await req.loadJSON()
  return json
}

async function loadLatestTrips(username, page=1) {
  console.log("Fetching latest trips, username: " + username + ", page: " + page)
  let url = "https://traewelling.de/api/v1/user/" + username + "/statuses?page=" + page
  let req = new Request(url)
  let json = await req.loadJSON()
  return json
}

function numberWithCommas(x, decimals=2) {
  x = x.toFixed(decimals)
        var parts = x.toString().split(".");
        parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,".");
        return parts.join(",");
}

function toHoursAndMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes };
}

function place_emoji(place) {
  let emojis = ["🥇", "🥈", "🥉"]
  
  index_place = place - 1
  if (index_place < emojis.length) {
    return emojis[index_place]
  }else{
    return "👾"
  }
}

function train_emoji(category) {
  let emojis = {"regional": "🚆", "regionalExp": "🚆", "national": "🚅", "nationalExpress": "🚅", "tram": "🚃", "bus": "🚌", "subway": "🚇", "suburban": "🚋", "ferry": "⛴️"}
  
  if (emojis[category] !== undefined) {
    return emojis[category]
  }else{
    return "🚂"
  }
}

// END UTILS FUNCTIONS
// -- START GITHUB FUNCTIONS --

async function checkRepoUpdates() {
  console.log("Checking for update")
    return new Promise((resolve, reject) => {
        const request = new Request('https://raw.githubusercontent.com/tiuub/traewelling-global-widget/main/version.json');
        request.loadJSON().then(json => {
            resolve(json['version'] !== VERSION);
        }).catch(err => {
            reject(err);
        })
    });
}

// END GITHUB FUNCTIONS
