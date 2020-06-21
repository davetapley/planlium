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

const NameInput = ({
  name,
  setName,
}: {
  name: string;
  setName: (name_: string) => void;
}) => (
  <Field>
    <Control>
      <Input
        type="text"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
      ></Input>
    </Control>
  </Field>
);

type HubSelectionState = "None" | "Active" | "Editing";

const HubList = ({
  hubs,
  setSelectionState,
  setName,
}: {
  hubs: Hub[];
  setSelectionState: (name: string, state: HubSelectionState) => void;
  setName: (oldName: string, newName: string) => void;
}) => {
  const rows = hubs.map(({ name, selectionState }) => (
    <div
      key={name}
      onMouseOver={() =>
        selectionState !== "Editing" && setSelectionState(name, "Active")
      }
      onMouseLeave={() => setSelectionState(name, "None")}
      onClick={() => {
        setSelectionState(name, "Editing");
      }}
      className={classNames({ active: selectionState === "Active" })}
    >
      <Panel.Block>
        <Panel.Icon>
          <i className="fas fa-map-marker"></i>
        </Panel.Icon>
        {selectionState === "Editing" ? (
          <NameInput
            name={name}
            setName={(name_) => setName(name, name_)}
          ></NameInput>
        ) : (
          name
        )}
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

type Hub = {
  name: string;
  position: LatLng;
  selectionState: HubSelectionState;
};

type HubMarkerProps = {
  range: number;
  positions: LatLng[];
  popup: ReactNode;
  position: LatLng;
  selectionState: HubSelectionState;
  onMouseOver: () => void;
  onMouseLeave: () => void;
};

const HubMarker = ({
  range,
  positions,
  popup,
  position,
  selectionState,
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
      switch (selectionState) {
        case "Active":
          leafletElement.openPopup();
          break;
        default:
          leafletElement.closePopup();
          break;
      }
    }
  }, [markerRef, selectionState]);

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
      hubs.concat({ name: hubName(), position: latlng, selectionState: "None" })
    );
  };
  const setSelectionState = (name_: string, state_: HubSelectionState) => {
    setHubs(
      hubs.map((hub) =>
        hub.name === name_ ? { ...hub, selectionState: state_ } : hub
      )
    );
  };
  const setName = (oldName: string, newName: string) => {
    setHubs(
      hubs.map((hub) =>
        hub.name === oldName ? { ...hub, name: newName } : hub
      )
    );
  };

  const positions = hubPositions(hubs);
  const markers = hubs.map(({ name, position, selectionState }) => (
    <HubMarker
      key={name}
      range={range}
      positions={positions}
      popup={<p>{name}</p>}
      position={position}
      selectionState={selectionState}
      onMouseOver={() => setSelectionState(name, "Active")}
      onMouseLeave={() => setSelectionState(name, "None")}
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
              <HubList
                hubs={hubs}
                setName={setName}
                setSelectionState={setSelectionState}
              ></HubList>
            </Column>
          </Columns>
        </Container>
      </Section>
    </>
  );
};

export default App;
