import { React, useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  FormLabel,
  RadioGroup,
  Select,
  MenuItem,
  InputLabel,
  Card,
} from "@mui/material";
import { FUNCTION_APP_URL, GEOCODE_API_KEY } from "../index.js";

const LocateNearestHospitalMyLoc = () => {
  const [hospitalData, setHospitalData] = useState();

  const [dept, setDept] = useState("");
  const [nearestHospital, setNearestHospital] = useState("");
  const [distanceHospital, setDistanceHospital] = useState("");
  const [currentLocationAvbl, setCurrentLocationAvbl] = useState(false);
  const [address, setAddress] = useState("");
  const [searchList, setSearchList] = useState([]);
  const [textToSearch, setTextToSearch] = useState("");
  const [locationOption, setLocationOption] = useState("currentLocation");
  const [formAddress, setFormAddress] = useState({ display_name: "" });
  const [showResult, setShowResult] = useState(true);

  //This function takes latitude and Longitude of 2 places as params, and returns the straight-line distance between the 2 places.
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  //This function receives the data of all Hospitals from the DB.
  function getHospitalDatafromDB() {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    fetch(FUNCTION_APP_URL, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        setHospitalData(result);
      })
      .catch((error) => console.error(error));
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [textToSearch]);

  //This function is linked to the "Search Places" text field. While you search anything in the text field, this function should provide the suggestions - related to whatever you have entered - Much like Google Search.
  async function fetchSuggestions() {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    // Replace this URL with the URL of your API and adjust query parameter if needed
    try {
      let res = await fetch(
        `https://geocode.maps.co/search?q=${textToSearch}&api_key=${GEOCODE_API_KEY}`,
        requestOptions
      );
      res = await res.text();
      //setSuggestions(JSON.parse(res ?? [])); // Assuming res is always JSON
      setSearchList(JSON.parse(res ?? []));
    } catch (e) {
      console.log(e);
    }
  }

  //TODO
  //Write a function, which receives latitude and longitude of a place as params, and set the response using setAddress() setter function. Hint: You may use 3rd Party API geocode.maps.co in this function
  function FindAddress(latitude, longitude) {
    fetch(
      `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=${GEOCODE_API_KEY}`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setAddress(data);
      });
  }

  function displayResults() {
    setShowResult(true);
  }

  /*
  This functions achieves following things 
  1) Iterate over {hospitalDataList}, which contains hospital data from Database. Latitude and longitude of a place is received via Param.
  2) Find the hospital which is nearest to the given latitude and longitude.
  3) Setter functions are already mentioned, you just have to pass the params.
  4) setNearestHospital(<pass nearest HospitalName here>)
  5) FindAddress(<pass latitude,longitude of nearest hospital here>)
  6) setDistanceHospital(<Pass dist of the nearest hospital>)

  */
  function findNearestHospital(Latitude, Longitude) {
    let minDist = 0;
    let nearestHospitalName = "";
    let hospitalDataList = [];
    if (hospitalData) hospitalDataList = JSON.parse(hospitalData);
    let latNearestHospital = 0;
    let longNearestHospital = 0;

    //TODO
    for (let i = 0; i < hospitalDataList?.length; i++) {
      let dist = getDistanceFromLatLonInKm(
        Latitude,
        Longitude,
        hospitalDataList[i]["Latitude"],
        hospitalDataList[i]["Longitude"]
      );
      if (
        (minDist === 0 || dist < minDist) &&
        hospitalDataList[i].SpecialitiesAvailable.includes(dept)
      ) {
        minDist = dist;
        nearestHospitalName = hospitalDataList[i]["Name"];
        latNearestHospital = hospitalDataList[i]["Latitude"];
        longNearestHospital = hospitalDataList[i]["Longitude"];
      }
    }
    setNearestHospital(nearestHospitalName);
    FindAddress(latNearestHospital, longNearestHospital);
    setDistanceHospital(minDist);
  }

  //This function fetches your current location, and based on the department selected, it will show the nearest hospital.
  function succeeded(position) {
    var currLatitude = position.coords.latitude;
    var currLongitude = position.coords.longitude;
    findNearestHospital(currLatitude, currLongitude);

    if (!currentLocationAvbl) alert("Location fetch Suceeded");
    setCurrentLocationAvbl(true);
  }

  // returns the distance from user entered location
  function distanceFromSpecifiedLocation(address) {
    var Latitude = address?.lat;
    var Longitude = address?.lon;
    findNearestHospital(Latitude, Longitude);
  }

  //execute getHospitalDatafromDB() when the page loads for first time
  //TODO
  useEffect(() => {
    getHospitalDatafromDB();
  }, []);

  useEffect(() => {
    if (textToSearch == null || textToSearch.length == 0) setSearchList([]);
  }, [textToSearch]);

  function failed() {
    alert("Location fetch failed");
  }

  function findLocation() {
    const result = navigator.geolocation.getCurrentPosition(succeeded, failed);
  }

  const handleDept = (event) => {
    setDept(event.target.value);
  };

  const handleLocation = (event) => {
    setLocationOption(event.target.defaultValue);
  };

  const findHospital = () => {
    findLocation();
    setShowResult(true);
  };

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ color: "#00338e" }}>
          <b>Healthcare Locator</b>
        </h1>
        <p color="00338e">
          <i>
            Finding the right hospital based on the specific medical needs and
            geographic location
          </i>
          <hr/>
        </p>

        <FormControl variant="outlined" className="form-control" sx={{ m: 2 }}>
          <InputLabel sx={{ fontSize: 14, fontWeight: 300, color: "black" }}>
            Select healthcare department
          </InputLabel>
          <Select
            className="select"
            value={dept}
            onChange={handleDept}
            label="Select Department"
            font-size="large"
          >
            <MenuItem value="ortho">Orthopaedics</MenuItem>
            <MenuItem value="cardio">Cardiology</MenuItem>
            <MenuItem value="gp">Others</MenuItem>
            <MenuItem value="dental">Dental</MenuItem>
            <MenuItem value="ophthalmology">Ophthalmology</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ alignSelf: "self-start", paddingLeft: 2 }}>
          <FormLabel
            id="demo-radio-buttons-group-label"
            sx={{ fontSize: 14, fontWeight: 300, color: "black" }}
          >
            Search hospital near:
          </FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="currentLocation"
            name="radio-buttons-group"
            onChange={handleLocation}
            row
          >
            <FormControlLabel
              value="currentLocation"
              control={<Radio />}
              label={
                <span style={{ fontSize: "14px" }}>My Current Location</span>
              }
              disabled={!dept}
            />
            <FormControlLabel
              value="enteredLocation"
              control={<Radio />}
              label={<span style={{ fontSize: "14px" }}>Entered Location</span>}
              disabled={!dept}
            />
          </RadioGroup>
        </FormControl>
              <br/>
        <Button
          hidden={locationOption != "currentLocation"}
          disabled={locationOption != "currentLocation"}
          color="primary"
          onClick={findHospital}
          className="button"
        >
          {!currentLocationAvbl ? "Find my location" : "Find Nearest Hospital"}
        </Button>

        <Autocomplete
        
          className="autocomplete"
          disablePortal
          hidden={locationOption === "currentLocation"}
          id="combo-box-demo"
          getOptionLabel={(option) => option.display_name}
          options={searchList}
          sx={{ width: 300,alignSelf: "self-start", paddingTop:2 }}
          value={formAddress}
          renderInput={(params) => (
            <TextField
              onChange={(e) => {
                setShowResult(false);
                setTextToSearch(e.target.value);
              }}
              {...params}
              label="Enter Address"
            />
          )}
          onChange={(e, value) => {
            setFormAddress(value);
            distanceFromSpecifiedLocation(value);
          }}
        />
        <br/>
        <Button
          hidden={locationOption === "currentLocation"}
          onClick={displayResults}
          className="button"
        >
          {"Find Nearest Hospital"}
        </Button>

        <Card>
          {nearestHospital && showResult && (
            <div style={{ padding: "5px" }}>
              <p>
                The nearest Hospital is<b> {nearestHospital},</b>{" "}
                {Math.round(distanceHospital)} KM away. Hospital Address:{" "}
                {address?.address?.neighbourhood}, {address?.address?.postcode}.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
//TODO: Currently, the logic shows the nearest hospital in the form of a Card. Modify to show all the nearest hospitals, sorted by their distance. The data should be represented in the form of a table.

export default LocateNearestHospitalMyLoc;
