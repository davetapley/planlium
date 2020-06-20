import "bulma/css/bulma.css";
import React, { useState } from "react";
import { Map, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "./App.css";
import { LeafletMouseEvent, LatLng } from "leaflet";

import {
  Control,
  Input,
  Panel,
  Columns,
  Column,
  Section,
  Icon,
  Field,
  Label,
  Button,
} from "trunx";

const perms = (n: number): number[][] => {
  const out: number[][] = [];
  for (var i = 0; i < n; i++) {
    for (var j = i + 1; j < n; j++) {
      out.push([i, j]);
    }
  }
  return out;
};

const minRange = 500;

const Range = ({
  range,
  setRange,
}: {
  range: number;
  setRange: (n: number) => void;
}) => {
  return (
    <Field isHorizontal hasAddons>
      <Field.Label>
        <Label>Max Range</Label>
      </Field.Label>
      <Field.Body>
        <Control hasIconsLeft>
          <Input
            type="number"
            step={100}
            min={minRange}
            value={range}
            onChange={(e) => setRange(parseInt(e.target.value))}
          ></Input>
          <Icon isLeft>
            <i aria-hidden="true" className="fas fa-ruler"></i>
          </Icon>
        </Control>
        <Control>
          <Button isStatic>meters</Button>
        </Control>
      </Field.Body>
    </Field>
  );
};

const opacity = (maxRange: number, x: LatLng, y: LatLng): number => {
  const distance = x.distanceTo(y);

  return 1 - (distance - minRange) / (maxRange - minRange);
};

const Controls = ({
  range,
  setRange,
}: {
  range: number;
  setRange: (n: number) => void;
}) => (
  <Panel>
    <Panel.Heading>Options</Panel.Heading>
    <Panel.Block>
      <Range range={range} setRange={setRange}></Range>
    </Panel.Block>
  </Panel>
);

const App = () => {
  const center = new LatLng(33.448, -112.074);

  const [range, setRange] = useState<number>(3000);
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
    return (
      <Polyline positions={[x, y]} opacity={opacity(range, x, y)}></Polyline>
    );
  });

  return (
    <Section>
      <Columns>
        <Column isOneFifth={true}>
          <Controls range={range} setRange={setRange} />
        </Column>
        <Column>
          <Map center={center} zoom={13} onClick={onClick}>
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
            />
            {markers}
            {lines}
          </Map>
        </Column>
      </Columns>
    </Section>
  );
};

export default App;
