/*
 * @license Copyright 2020 S4 NetQuest, LTD.
 * @preserve version	1.0.0
 * @preserve date	04.15.2020
 *
 * Interaction with biodigital human API
 *
 * REVISIONS
 * 20200415 SHS - Initial commit
 */

//Storyline
var player = new Player().init();

if (player != null) {
  document.getElementById("myWidget").setAttribute("src", player.GetVar("biodigitalPath") + '&dk=' + player.GetVar("biodigitalKey") + '&lang=' + player.GetVar("lang"));
}

var version = "1.0.0"
var showAllCorrectParts;
var sceneObjects = {};
var sceneObjectsSelected = [];
var objectsSelected = {};
var aObjectsSelected = [];
var correctPartId;
var correctPartIds = [];
var activityCompleted = false;

console.log("main.js version:",version);

showAllCorrectParts = player.GetVar("webShowAll");
console.log("showAllCorrectParts", showAllCorrectParts);

var human = new HumanAPI("myWidget");

player.custom = function (data) {
  console.log("custom from activity localized");
  console.log('custom:', data);
  console.log('activityCompleted:', activityCompleted);
  if (player != null) {
    //correctPartId = player.GetVar("correctPartId");
    //correctPartIds = correctPartId.split(",");
    //console.log("correctPartId:", correctPartId);
    //console.log("correctPartIds:", correctPartIds);
    //recursively search all scene objects for one that contains the correct string and get its ID
    //var correctPartId = getObject(sceneObjects).objectId;
    hiliteAllCorrectParts();

    if (!activityCompleted) setTimeout(function () { player.SetVar("submitEnabled", false) }, 250);
    activityCompleted = true;
  }
}

player.config = function (data) {
  var aOptions = [];
  console.log('config:', data);
  aOptions = Object.entries(data);
  for (var i = 0; i < aOptions.length; i++) {
    console.log('config:', aOptions[i][0], aOptions[i][1]);
    try {
      human.send(aOptions[i][0], aOptions[i][1]);
    } catch (e) {
      console.log(e);
    }
  }
}

player.humanSend = function (data) {
  var aOptions = [];
  console.log('humanSend:', data);
  aOptions = Object.entries(data);
  for (var i = 0; i < aOptions.length; i++) {
    console.log('humanSend:', aOptions[i][0], aOptions[i][1]);
    try {
      human.send(aOptions[i][0], aOptions[i][1]);
    } catch (e) {
      console.log(e);
    }
  }
}

//Event dispatched from Storyline via custom javascript trigger. Event listener added in recursive function in Player-1.0.3.js since that's where it finds the iframe's parent window which contains the storyline player.
function storyEvent(detail) {
  console.log("storyEvent from activity localized");
  var eventData = typeof (detail.data) == 'object' ? detail.data : {};
  //console.log(eventData);

  switch (detail.eventName) {
    case 'custom':
      player.custom(eventData);
      break;
    case 'config':
      player.config(eventData);
      break;
    case 'humanSend':
      player.humanSend(eventData);
      break;
  }
}

function hiliteAllCorrectParts() {
  console.log("select hilite all correct parts");
  //create object to pass to human API
  var selectObj = {};


  //select the correct one(s)
  for (var p = 0; p < correctPartIds.length; p++) {
    selectObj[correctPartIds[p]] = true;
  }

  //deselect all others
  selectObj["replace"] = true;
  human.send("scene.selectObjects", selectObj);
}

human.on("scene.picked", function (event) {
  // user clicked on a object, providing the 3D "position"
  if (event.objectId && event.position) {
    var selectedPartId = event.objectId;

    console.log("Picked:", selectedPartId);
    console.log("correctPartIds:", correctPartIds, correctPartIds.length);


    for (var p = 0; p < correctPartIds.length; p++) {
      console.log("COMPARE", correctPartIds[p], selectedPartId);
      if (correctPartIds[p] == selectedPartId) {
        console.log("matches one of the possible correct answers", correctPartIds[p]);
        selectedPartId = correctPartIds.join(",");
        console.log("selectedPartId to SEND", selectedPartId);

        if (showAllCorrectParts) hiliteAllCorrectParts();

        break;
      }
    }

    console.log("FINAL selected:", selectedPartId);
    console.log("activityCompleted", activityCompleted);

    if (player != null) {
      if (!activityCompleted) player.SetVar("submitEnabled", true);
      console.log("SETTING selectedPartId->", selectedPartId);
      player.SetVar("selectedPartId", selectedPartId);
    }
  }
});


/* human.on('scene.objectsSelected', function (obj) {
  objectsSelected = obj;
  aObjectsSelected = Object.entries(objectsSelected);
  //console.log('scene.objectsSelected',objectsSelected);
  console.log("CHECKING SELECTION");

  for (var i = 0; i < aObjectsSelected.length; i++) {
    if (aObjectsSelected[i][1]) {
      console.log("selected:", aObjectsSelected[i][0]);
      pickedObjectId = aObjectsSelected[i][0];
      pickedObject = sceneObjects[pickedObjectId];

      var selectedPartId = pickedObject.objectId;

      console.log("selected", pickedObject.objectId);
      console.log("correctPartIds", correctPartIds, correctPartIds.length);


      for (var p = 0; p < correctPartIds.length; p++) {
        console.log("COMPARE", correctPartIds[p], pickedObject.objectId);
        if (correctPartIds[p] == pickedObject.objectId) {
          console.log("  matches one of the possible correct answers", correctPartIds[p]);
          selectedPartId = correctPartIds.join(",");
          console.log("selectedPartId to SEND", selectedPartId);

          if (showAllCorrectParts) hiliteAllCorrectParts();

          break;
        }
      }

      console.log("FINAL selected:", selectedPartId);
      console.log("activityCompleted", activityCompleted);

      if (player != null) {
        if (!activityCompleted) player.SetVar("submitEnabled", true);
        console.log("SETTING selectedPartId->", selectedPartId);
        player.SetVar("selectedPartId", selectedPartId);
      }
      return;
    }
  }
  //console.log("nothing selected");
  if (player != null) {
    player.SetVar("submitEnabled", false);
    player.SetVar("selectedPartId", "");
  }
}); */

human.once("human.ready", function () {
  console.log("human.ready");
  if (player != null) {
    player.SetVar("humanReady", Math.random().toString().slice(2, 11));
    correctPartId = player.GetVar("correctPartId");
    correctPartId.indexOf(",") >= 0 ? correctPartIds = correctPartId.split(",") : correctPartIds[0] = correctPartId;
    console.log("correctPartId:", correctPartId);
    console.log("correctPartIds:", correctPartIds);
  }
  //document.getElementById("widget-cover").style.display = "none";
  // get a list of objects
  human.send("scene.info", function (data) {
    // get global objects
    console.log("data: ", data);
    sceneObjects = data.objects;
  });
});