import { Action, ActionPanel, getPreferenceValues, List, showToast, Toast } from "@raycast/api";
import Fuse from 'fuse.js';
import { useCallback, useEffect, useRef, useState } from "react";
import { getFavorites } from './modules/getFavorites';
import { getNow, Location, Now } from './modules/getNow';

const {flag} = require('country-emoji');

const options = {
  includeScore: true,
  keys: [
    {
      name: 'city',
      weight: 2
    },
    {
      name: 'country',
      weight: 1
    },
    {
      name: 'province',
      weight: 0.5
    }
  ],
  sortFn: (a: any, b: any) =>
    a.score === b.score ? (a.item.population < b.item.population ? -1 : 1) : a.score < b.score ? -1 : 1
}

const cityTimezones = require('city-timezones')
const cityMapping = cityTimezones.cityMapping

const fuse = new Fuse(cityMapping, options)


export default function Command() {
  const { hourFormat } = getPreferenceValues()
  const [results, isLoading, search] = useSearch()
  
  return (
    <List isLoading={isLoading} onSearchTextChange={search} searchBarPlaceholder="Now in ..." throttle>
      <List.Item title={new Date().toLocaleString()}/>
      {!isLoading && results.length === 0
        ? <List.Section title="Favorites">
            {getFavorites().map((item) => (
              <ListItem key={item.location} item={item} is24={hourFormat} />
            ))}
          </List.Section>
        : <List.Section title="Results" subtitle={results.length + ""}>
          {results.map((item, key) => (
            <ListItem key={key} item={item} is24={hourFormat} />
            // <ListItem key={searchResult.name} searchResult={searchResult} />
          ))}
          </List.Section>
      }
    </List>
  )
}

// @ts-ignore
function ListItem({ item, is24 }: { item: Now, is24: Boolean }) {
  return (
      <List.Item
        icon={flag(item.iso)}
        title={{ tooltip: item.country, value: item.location }}
        subtitle={is24 ? item.time : item.time12}
        accessories={[{ text: `${item.offset}${item.comparedToMe}` }]}
        actions={
          <ActionPanel>
            <Action.CopyToClipboard content={item.time} />
          </ActionPanel>
        }
      />
  )
}

function useSearch() {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Now[]>([]);
  const cancelRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async function search(searchText: string) {
      cancelRef.current?.abort()
      cancelRef.current = new AbortController()
      setIsLoading(true)
      try {
        const results = await performSearch(searchText, cancelRef.current.signal);
        setResults(results);
      } catch (error) {
        console.error("search error", error);
        showToast({
          style: Toast.Style.Failure,
          title: "Could not perform search",
          message: String(error),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [cancelRef, setIsLoading, setResults]
  );

  useEffect(() => {
    search("");
    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  return [results, isLoading, search] as const;
}
 
async function performSearch(searchText: string, signal: AbortSignal): Promise<Now[] | []> {
  // start search with 2 or mor characters
  if (searchText.length > 2) {
    const now = new Date()
    const result = fuse.search(searchText, { limit: 10 }).map(( { item } ) => getNow(now, {
      // @ts-ignore
      city: item.city,
      // @ts-ignore
      country: item.country,
      // @ts-ignore
      iso: item.iso2,
      // @ts-ignore
      timezone: item.timezone,
      // @ts-ignore
      population: item.pop
    } as Location))
    // @ts-ignore
    console.log(result)
    
    return result
  }
  return []
}