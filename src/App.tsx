import React, { useState } from "react";
import { Map, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "./App.css";
import { LeafletMouseEvent, LatLng } from "leaflet";

const perms = (n: number): number[][] => {
  const out: number[][] = [];
  for (var i = 0; i < n; i++) {
    for (var j = i + 1; j < n; j++) {
      out.push([i, j]);
    }
  }
  return out;
};

const opacity = (x: LatLng, y: LatLng): number => {
  const distance = x.distanceTo(y);
  const minDist = 500;
  const maxDist = 3000;

  if (distance < minDist) {
    return 0;
  } else if (distance > maxDist) {
    return 0;
  }

  return 1 - (distance - minDist) / (maxDist - minDist);
};

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

  const lines = perms(positions.length).map(([x_, y_]) => {
    const x = positions[x_];
    const y = positions[y_];
    return <Polyline positions={[x, y]} opacity={opacity(x, y)}></Polyline>;
  });

  console.log(lines);
  console.log(perms(3));

  return (
    <>
      <Map center={center} zoom={13} onClick={onClick}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />
        {markers}
        {lines}
      </Map>
    </>
  );
};

export default App;
