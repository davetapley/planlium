import React, { useState } from "react";
import { Map, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "./App.css";
import { LeafletMouseEvent, LatLng } from "leaflet";

const App = () => {
  const center = new LatLng(33.448, -112.074);

  const [positions, setPositions] = useState<LatLng[]>([]);

  const onClick = (event: LeafletMouseEvent): void => {
    const { latlng } = event;
    setPositions(positions.concat(latlng));
  };

  const marker = (position: LatLng) => (
    <Marker position={position}>
      <Popup>This is {position.toString()}</Popup>
    </Marker>
  );
  const markers = positions.map(marker);

  const lines = positions.map((position) => {
    return positions
      .filter((position1) => position != position1)
      .map((position1) => (
        <Polyline positions={[position, position1]}></Polyline>
      ));
  });

  console.log(lines);

  return (
    <Map center={center} zoom={13} onClick={onClick}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
      />
      {markers}
      {lines}
    </Map>
  );
};

export default App;
