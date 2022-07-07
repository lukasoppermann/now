import { Location } from "..";
import { getFavorites } from "./favorites";
import { Now, getNow } from "./getNow";
import { parseInput } from "./parseInput";
import Fuse from "fuse.js";
import cityTimezones = require("city-timezones");

interface City {
  city: string;
  country: string;
  iso2: string;
  timezone: string;
}

const options = {
  includeScore: true,
  keys: [
    {
      name: "city",
      weight: 2,
    },
    {
      name: "country",
      weight: 1,
    },
    {
      name: "province",
      weight: 0.5,
    },
  ],
};

const fuse = new Fuse(<City[]>cityTimezones.cityMapping, options);

export async function performSearch(searchText: string, setFavorites: any): Promise<Now[] | []> {
  // start search with 2 or mor characters
  if (searchText.length > 2) {
    const { location, time: searchTime, isMyTime } = parseInput(searchText);
    // set now and time
    const now = new Date();
    const time = searchTime || now;
    //
    if ((!location || isMyTime === false) && typeof time === "string") {
      getFavorites(time).then((storedFavorites) => {
        setFavorites(storedFavorites);
      });
      return [];
    }
    // return search results
    return fuse.search(location, { limit: 10 }).map(({ item }: { item: City }) => {
      return getNow(time, {
        city: item.city,
        country: item.country,
        iso2: item.iso2,
        timezone: item.timezone,
      } as Location);
    });
  }
  // return empty arry if no results
  return [];
}
