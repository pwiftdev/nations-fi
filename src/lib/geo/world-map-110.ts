import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { feature } from "topojson-client";
import countries110m from "world-atlas/countries-110m.json";

type CountriesTopology = Topology<{ countries: GeometryCollection }>;

const topo = countries110m as unknown as CountriesTopology;
const collection = feature(topo, topo.objects.countries);

/** Natural Earth 110m — lighter than 50m for responsive 2D SVG. */
export const worldMapCountries: FeatureCollection<
  Geometry,
  Record<string, unknown>
> = {
  type: "FeatureCollection",
  features: collection.features.filter(
    (f): f is Feature<Geometry, Record<string, unknown>> => f.geometry != null,
  ),
};
