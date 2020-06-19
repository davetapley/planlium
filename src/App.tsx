import React, { useState } from "react";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import "./App.css";
import { LeafletMouseEvent, LatLng } from "leaflet";

const App = () => {
  const center = new LatLng(33.448, -112.074);

  const [position, setPosition] = useState<LatLng>(center);

  const onClick = (event: LeafletMouseEvent): void => {
    const { latlng } = event;
    setPosition(latlng);
  };

  return (
    <Map center={center} zoom={13} onClick={onClick}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>This is {position.toString()}</Popup>
      </Marker>
    </Map>
  );
};

export default App;
