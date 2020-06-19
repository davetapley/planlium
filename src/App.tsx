import React from "react";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const position = { lat: 33.448, lng: -112.074 };
  return (
    <Map center={position} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </Map>
  );
}

export default App;
