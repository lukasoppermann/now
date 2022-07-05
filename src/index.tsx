import { Action, ActionPanel, getPreferenceValues, Icon, List, showToast, Toast } from "@raycast/api";
import Fuse from 'fuse.js';
import { useCallback, useEffect, useRef, useState } from "react";
import { addToFavorites, getFavorites, isFavorite, moveFavorite, removeFromFavorites } from './modules/favorites';
import { getNow, Now } from './modules/getNow';
import { parseInput } from './modules/parseInput';

const {flag} = require('country-emoji');

export interface Location {
  city: string,
  country: string,
  iso: string,
  timezone: string
}

type FavoriteActions = 'remove' | 'add' | 'up' | 'down'

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
  ]
}

const cityTimezones = require('city-timezones')
const cityMapping = cityTimezones.cityMapping

const fuse = new Fuse(cityMapping, options)


export default function Command() {
  const { hourFormat } = getPreferenceValues()
  const [favorites, setFavorites] = useState<Now[]>([])
  const [results, isLoading, search] = useSearch(setFavorites)

  useEffect(() => {
    getFavorites().then(storedFavorites => {
      setFavorites(storedFavorites)
    })
  }, []);
  
  const updateFavorites = async (item: Now, action: FavoriteActions) => {
    let newFav: Now[] = []
    if(action === 'remove') {
      newFav = await removeFromFavorites(item)
    }
    if(action === 'add') {
      newFav = await addToFavorites(item)
    }
    if(action === 'up' || action === 'down') {
      newFav = await moveFavorite(item, action)
    }
    // set favorites
    return setFavorites(newFav)
  }
  

  return (
    <List isLoading={isLoading} onSearchTextChange={search} searchBarPlaceholder="Now in ..." throttle>
      {!isLoading && results.length === 0
        ? <List.Section title="Favorites">
            {favorites.map((item) => (
              <ListItem 
                key={item.city} 
                item={item} 
                is24={hourFormat} 
                isFav={isFavorite(item, favorites)} 
                updateFavorites={updateFavorites}
              />
            ))}
          </List.Section>
        : <List.Section title="Results" subtitle={results.length + ""}>
          {results.map((item, key) => (
            <ListItem 
              key={key}
              item={item}
              is24={hourFormat}
              isFav={isFavorite(item, favorites)}
              updateFavorites={updateFavorites} 
            />
          ))}
          </List.Section>
      }
    </List>
  )
}

// @ts-ignore
function ListItem({ item, is24, isFav, updateFavorites }: { item: Now, is24: Boolean, isFav: Boolean, updateFavorites: Function }) {
  
  return (
      <List.Item
        icon={flag(item.iso)}
        title={{ tooltip: item.country, value: item.city }}
        subtitle={is24 ? item.time : item.time12}
        accessories={[{ text: `${item.offset}${item.comparedToMe}` }]}
        actions={
          <ActionPanel>
            <ActionPanel.Section>
              <Action.CopyToClipboard content={is24 ? item.time : item.time12} />
              { isFav 
                ? <Action icon={Icon.Star} title="Remove from favorites" onAction={ () => updateFavorites(item, 'remove') } />
                : <Action icon={Icon.Star} title="Add to favorites" onAction={ () => updateFavorites(item, 'add') } />
              }
            </ActionPanel.Section>
            { isFav ? 
              <ActionPanel.Section>
                <Action icon={Icon.ChevronUp} title="Move up in favorites" onAction={ () => updateFavorites(item, 'up') } shortcut={{ modifiers: ["cmd", "opt"], key: "arrowUp" }} />
                <Action icon={Icon.ChevronDown} title="Move down in favorites" onAction={ () => updateFavorites(item, 'down') } shortcut={{ modifiers: ["cmd", "opt"], key: "arrowDown" }} />
              </ActionPanel.Section>
              : ""
            }
          </ActionPanel>
        }
      />
  )
}

function useSearch(setFavorites: Function) {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Now[]>([]);
  const cancelRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async function search(searchText: string) {
      cancelRef.current?.abort()
      cancelRef.current = new AbortController()
      setIsLoading(true)
      try {
        const results = await performSearch(searchText, setFavorites);
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
    search("")
    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  return [results, isLoading, search] as const;
}
 
async function performSearch(searchText: string, setFavorites: Function): Promise<Now[] | []> {
  // start search with 2 or mor characters
  if (searchText.length > 2) {
    const {location, time: searchTime} = parseInput(searchText)
    
    const now = new Date()
    const time = searchTime || now

    if(!location && typeof time === 'string') {
      getFavorites(time).then(storedFavorites => {
        setFavorites(storedFavorites)
      })
    }

    // @ts-ignore
    const result = fuse.search(location, { limit: 10 }).map(( { item } ) => getNow(time, {
      // @ts-ignore
      city: item.city,
      // @ts-ignore
      country: item.country,
      // @ts-ignore
      iso: item.iso2,
      // @ts-ignore
      timezone: item.timezone,
    } as Location))
    //    
    return result
  }
  return []
}
