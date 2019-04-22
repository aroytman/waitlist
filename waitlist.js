
function waitlist() {
  
  pjs.defineDisplay("display", "waitlist.json");

  // Get User / Prompt to Log In  
  user = pjs.getUser();
  var user = pjs.getUser();
  if (!user) {
    display.login.execute();
    return;
  }

  // Default location and party size
  location = 'San Francisco';
  partySize = 2;

  while (true) {  
    message = getMessage();    
    var response = display.main.execute();
    if (joinButton) {
      join(response);
    }
    if (seeListButton) {
      showList();
    }
    if (editLocationIcon) {      
      askLocation();
    }
  }

  // Prompt to select a location
  function askLocation() {
    var locations = pjs.query("SELECT city FROM locations");
    locations.forEach(record => {
      if (record.city === location) record.selected = "1";  // Select current location
    })
    display.locationsGrid.replaceRecords(locations);
    location = '';
    while (!location) {
      display.locations.execute();
      var selectedLocations = display.locationsGrid.filter(record => (record.selected === "1"));
      if (selectedLocations.length === 1) {
        location = selectedLocations[0].city;
      }    
    }
  }

  // Join the waitlist
  function join(data) {

    if (partySize < 1) {
      display.popupMessage.execute({ message: "You must have at least 1 person in your party." });
      return;
    }

    if (pjs.query("SELECT user FROM waitlist WHERE location = ? AND user = ?", [location, user]).length > 0) {
      display.popupMessage.execute({ message: "You are already on the list" });
      return;
    }

    pjs.query("INSERT INTO waitlist SET ?", {
      location,
      user,
      partySize,
      phone,
      notes,
      timestamp: new Date()
    });
    phone = 0;
    notes = '';
    display.popupMessage.execute({ message: "Your party was added to the list!" });
  }

  // Show waitlist
  function showList() {
    backButton = false;
    while (!backButton) {
      display.grid.replaceRecords(pjs.query("SELECT user, partySize FROM waitlist WHERE location = ?", location));
      display.list.execute();
      var recordsToRemove = display.grid.filter(entry => entry.remove);
      recordsToRemove.forEach(record => pjs.query("DELETE FROM waitlist WHERE user = ? AND location = ?", [record.user, location]));
    }
  }

  function getMessage() {
    var count = pjs.query("SELECT COUNT(*) FROM waitlist WHERE location = ?", location)[0]["COUNT(*)"];
    switch (count) {
      case 0:
        return "There is no one currently on the waitlist!";
      case 1:
        return "There is 1 party on the waitlist.";
      default:
        return "There is " + count + " parties on the waitlist.";
    }
    
  }

}

exports.run = waitlist;
