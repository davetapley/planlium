import "bulma/css/bulma.css";
import React, { useState } from "react";
import { Map, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "./App.css";
import { LeafletMouseEvent, LatLng } from "leaflet";
import { uniqueNamesGenerator } from "unique-names-generator";

import {
  Control,
  Input,
  Panel,
  Columns,
  Column,
  Section,
  Field,
  Label,
  Button,
  Hero,
  Title,
  Container,
  Subtitle,
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
    <Field hasAddons>
      <Label>Max Range</Label>
      <Control>
        <Input
          type="number"
          step={100}
          min={minRange}
          value={range}
          onChange={(e) => setRange(parseInt(e.target.value))}
        ></Input>
      </Control>
      <Control>
        <Button isStatic>m</Button>
      </Control>
    </Field>
  );
};

const lineOpacity = (maxRange: number, x: LatLng, y: LatLng): number => {
  const distance = x.distanceTo(y);

  if (distance < minRange) {
    return 0;
  } else {
    const raw = 1 - (distance - minRange) / (maxRange - minRange);
    const o = Math.max(0, Math.min(1, raw));
    console.log(o);
    return o;
  }
};

const markerOpacity = (
  maxRange: number,
  positions: LatLng[],
  position: LatLng
): number => {
  const sum = positions.reduce((prev, position_) => {
    return prev + lineOpacity(maxRange, position, position_);
  }, 0);
  return 0.5 + sum / positions.length;
};

const Hubs = ({ hubs }: { hubs: Hub[] }) => {
  const rows = hubs.map((hub) => (
    <Panel.Block>
      <Panel.Icon>
        <i className="fas fa-map-marker"></i>
      </Panel.Icon>
      {hub.name}
    </Panel.Block>
  ));
  return (
    <Panel>
      <Panel.Heading>Hubs</Panel.Heading>
      {rows}
    </Panel>
  );
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

type Hub = { name: string; position: LatLng };

const hubName = () =>
  uniqueNamesGenerator({ separator: " ", style: "capital", length: 2 });

const hubPositions = (hubs: Hub[]) => hubs.map(({ position }) => position);

const App = () => {
  const center = new LatLng(33.448, -112.074);

  const [range, setRange] = useState<number>(3000);
  const [hubs, setHubs] = useState<Hub[]>([]);

  const onClick = (event: LeafletMouseEvent): void => {
    const { latlng } = event;
    setHubs(hubs.concat({ name: hubName(), position: latlng }));
  };

  const positions = hubPositions(hubs);
  const marker = (position: LatLng) => (
    <Marker
      position={position}
      opacity={markerOpacity(range, positions, position)}
    >
      <Popup>
        This is {position.toString()}
        {"     "}
        {markerOpacity(range, positions, position)}
      </Popup>
    </Marker>
  );
  const markers = positions.map(marker);

  const lines = perms(positions.length).map(([x_, y_]) => {
    const x = positions[x_];
    const y = positions[y_];
    return (
      <Polyline
        positions={[x, y]}
        opacity={lineOpacity(range, x, y)}
      ></Polyline>
    );
  });

  return (
    <>
      <Section isMarginLess isPaddingLess>
        <Container>
          <Title>Helium Hub planner</Title>
          <Subtitle>Map name here</Subtitle>
        </Container>
      </Section>
      <Section>
        <Container>
          <Columns>
            <Column>
              <Map center={center} zoom={15} onClick={onClick}>
                <TileLayer
                  attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                  url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                />
                {markers}
                {lines}
              </Map>
            </Column>
            <Column isOneFifth={true}>
              <Controls range={range} setRange={setRange} />
              <Hubs hubs={hubs}></Hubs>
            </Column>
          </Columns>
        </Container>
      </Section>
    </>
  );
};

export default App;
