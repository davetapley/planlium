import "bulma/css/bulma.css";
import "./App.css";
import classNames from "classnames";
import React, { useState, useRef, useEffect, ReactNode } from "react";
import { Map, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
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

  const raw = Math.max(0, distance - minRange) / (maxRange - minRange);
  return 1 - Math.min(1, raw);
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

const Hubs = ({
  hubs,
  selected: setSelected,
}: {
  hubs: Hub[];
  selected: (name: string, selected: boolean) => void;
}) => {
  const rows = hubs.map(({ name, selected }) => (
    <div
      key={name}
      onMouseOver={() => setSelected(name, true)}
      onMouseLeave={() => setSelected(name, false)}
      className={classNames({ active: selected })}
    >
      <Panel.Block>
        <Panel.Icon>
          <i className="fas fa-map-marker"></i>
        </Panel.Icon>
        {name}
      </Panel.Block>
    </div>
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

type Hub = { name: string; position: LatLng; selected: boolean };

type HubMarkerProps = {
  range: number;
  positions: LatLng[];
  popup: ReactNode;
  position: LatLng;
  selected: boolean;
  onMouseOver: () => void;
  onMouseLeave: () => void;
};

const HubMarker = ({
  range,
  positions,
  popup,
  position,
  selected,
  onMouseOver,
  onMouseLeave,
}: HubMarkerProps) => {
  // Some ref magic to call openPopup and closePopup
  const markerRef = useRef<Marker | null>(null);

  // Without useEffect you get:
  //   Warning: Cannot update during an existing state transition (such as within `render`).
  //   Render methods should be a pure function of props and state.
  useEffect(() => {
    if (markerRef.current) {
      const { leafletElement } = markerRef.current;
      selected ? leafletElement.openPopup() : leafletElement.closePopup();
    }
  }, [markerRef, selected]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      opacity={markerOpacity(range, positions, position)}
      onmouseover={onMouseOver}
      onmouseout={onMouseLeave}
    >
      <Popup autoClose={false} auto>
        {popup}
      </Popup>
    </Marker>
  );
};

const hubPositions = (hubs: Hub[]) => hubs.map(({ position }) => position);

const hubName = () =>
  uniqueNamesGenerator({ separator: " ", style: "capital", length: 2 });

const App = () => {
  const center = new LatLng(33.448, -112.074);

  const [range, setRange] = useState<number>(3000);
  const [hubs, setHubs] = useState<Hub[]>([]);

  const onClick = (event: LeafletMouseEvent): void => {
    const { latlng } = event;
    setHubs(
      hubs.concat({ name: hubName(), position: latlng, selected: false })
    );
  };
  const setSelected = (name_: string, selected_: boolean) => {
    setHubs(
      hubs.map((hub) =>
        hub.name === name_ ? { ...hub, selected: selected_ } : hub
      )
    );
  };

  const positions = hubPositions(hubs);
  const markers = hubs.map(({ name, position, selected }) => (
    <HubMarker
      key={name}
      range={range}
      positions={positions}
      popup={<p>{name}</p>}
      position={position}
      selected={selected}
      onMouseOver={() => setSelected(name, true)}
      onMouseLeave={() => setSelected(name, false)}
    ></HubMarker>
  ));

  const lines = perms(positions.length).map(([x_, y_]) => {
    const x = positions[x_];
    const y = positions[y_];
    return (
      <Polyline
        key={[x, y].toString()}
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
              <Hubs hubs={hubs} selected={setSelected}></Hubs>
            </Column>
          </Columns>
        </Container>
      </Section>
    </>
  );
};

export default App;
